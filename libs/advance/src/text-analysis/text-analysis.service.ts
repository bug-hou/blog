import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocItem, DocItemDocument } from './doc-item.model';
import { DictWord, DictWordDocument } from './dict-word.model';
const readingTime = require('reading-time');
import wordsCount from 'words-count';
import * as nodejieba from 'nodejieba';
import axios from 'axios';
import * as natural from 'natural';
import { mdToText } from '@utils/mdToStr';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class TextAnalysisService implements OnModuleInit {
  private chineseTokenizer: any;
  private englishTokenizer: natural.WordTokenizer;
  constructor(
    @InjectModel(DocItem.name) private docModel: Model<DocItemDocument>,
    @InjectModel(DictWord.name) private dictModel: Model<DictWordDocument>,
    @Inject(EventEmitter2) private eventEmitter: EventEmitter2
  ) {
  }

  async onModuleInit() {
    // 加载自定义分词字典到 nodejieba
    const dictWords = await this.dictModel.find().lean();
    if (dictWords && dictWords.length > 0) {
      for (const item of dictWords) {
        nodejieba.insertWord(item.word);
      }
    }

    // 初始化nodejieba
    // nodejieba.load({
    //   userDict: `${__dirname}/userdict.txt`,
    // });
    this.chineseTokenizer = nodejieba;
    this.englishTokenizer = new natural.WordTokenizer();
  }

  tokenize(text: string): string[] {
    // 特殊字符保护
    const protectedSegments = this.extractProtectedSegments(text);

    // 临时替换保护部分
    let tempText = text;
    protectedSegments.forEach((seg, i) => {
      tempText = tempText.replace(seg.original, '');
    });

    // 识别中英文主导模式
    const isChineseDominant = this.detectLanguageDominance(tempText);

    // 根据主导语言选择分词策略
    const tokens = isChineseDominant
      ? this.tokenizeChineseDominant(tempText)
      : this.tokenizeEnglishDominant(tempText);

    return tokens;
  }

  /**
   * 检测文本语言主导模式
   */
  private detectLanguageDominance(text: string): boolean {
    // 过滤掉保护标记
    const cleanText = text.replace(/\{PROTECTED_\d+\}/g, '');

    // 统计中英文字符数量
    const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishChars = (cleanText.match(/[a-zA-Z]/g) || []).length;

    // 计算比例阈值
    return chineseChars / (chineseChars + englishChars) > 0.4;
  }

  /**
   * 中文主导模式下的分词
   */
  private tokenizeChineseDominant(text: string): string[] {
    // 第一步：粗粒度切分
    const segments = this.chineseTokenizer.cut(text, true);

    // 第二步：处理英文短语
    const processed: string[] = [];

    segments.forEach(segment => {
      if (/^[a-zA-Z\s]+$/.test(segment)) {
        // 纯英文段，使用英文分词
        const words = this.englishTokenizer.tokenize(segment);
        processed.push(...words.filter(w => w.trim()));
      } else {
        // 中英混合段，深度切分
        processed.push(...this.handleMixedSegment(segment));
      }
    });

    return processed;
  }

  /**
   * 英文主导模式下的分词
   */
  private tokenizeEnglishDominant(text: string): string[] {
    // 第一步：按空格初步切分
    const words = this.englishTokenizer.tokenize(text);

    // 第二步：处理中文短语
    const processed: string[] = [];

    words.forEach(word => {
      if (/[\u4e00-\u9fa5]/.test(word)) {
        // 包含中文，深度切分
        processed.push(...this.handleMixedSegment(word));
      } else {
        // 纯英文，直接使用
        processed.push(word);
      }
    });

    return processed;
  }

  /**
   * 处理中英混合单段
   */
  private handleMixedSegment(segment: string): string[] {
    const tokens = [];
    let current = '';
    let isLatin = false;

    for (const char of segment) {
      // 判断字符类型
      const isCharLatin = /^[a-zA-Z0-9_\.@\-]$/.test(char);

      if (current === '') {
        current = char;
        isLatin = isCharLatin;
      } else if (isLatin === isCharLatin) {
        current += char;
      } else {
        tokens.push(current);
        current = char;
        isLatin = isCharLatin;
      }
    }

    if (current) tokens.push(current);

    // 深度处理纯中文段
    const finalTokens: string[] = [];

    tokens.forEach(token => {
      if (/[\u4e00-\u9fa5]/.test(token) && !/^[a-zA-Z]/.test(token)) {
        // 纯中文部分使用Jieba再分词
        const subTokens = this.chineseTokenizer.cut(token, true);
        finalTokens.push(...subTokens);
      } else {
        finalTokens.push(token);
      }
    });

    return finalTokens;
  }

  /**
   * 提取保护段（URL、邮箱、代码等）
   */
  private extractProtectedSegments(text: string): Array<{ original: string, position: number }> {
    const patterns = [
      // URL匹配
      /(https?:\/\/[^\s]+)/g,
      // 邮箱匹配
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      // 文件名/扩展名
      /(\b\w+\.(js|ts|java|py|cpp|h|html|css|scss|less|json|md))\b/g,
      // 版本号
      /(v?\d+\.\d+(\.\d+)?)/g,
      // 驼峰命名法
      /([a-z]+[A-Z][a-z]*)/g,
      // Pascal命名法
      /([A-Z][a-z]+[A-Z]?[a-z]*)/g,
      // 常量命名法
      /([A-Z_]{2,})/g
    ];

    const protectedSegments: Array<{ original: string, position: number }> = [];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        protectedSegments.push({
          original: match[0],
          position: match.index
        });
      }
    });

    // 按位置排序
    protectedSegments.sort((a, b) => a.position - b.position);

    return protectedSegments;
  }

  /**
   * 提取关键词（混合文本优化版）
   */
  extractKeywords(text: string, topN = 10): string[] {
    const tokens = this.tokenize(text);

    // 过滤停用词（中英文）
    const filtered = tokens.filter(token =>
      token.length > 1 && !this.isStopWord(token)
    );

    // 词频统计
    const freqMap: Record<string, number> = {};
    filtered.forEach(token => {
      freqMap[token] = (freqMap[token] || 0) + 1;
    });

    // 按词频排序
    const sorted = Object.keys(freqMap).sort((a, b) =>
      freqMap[b] - freqMap[a]
    );

    return sorted.slice(0, topN);
  }

  /**
   * 判断是否为停用词
   */
  private isStopWord(word: string): boolean {
    // 常见中文停用词（可根据需要扩展）
    const chineseStopWords = [
      '的', '了', '是', '在', '和', '与', '也', '就', '都', '而', '及', '与', '着', '或', '一个', '没有', '我们', '你', '我', '他', '她', '它', '他们', '她们', '它们',
      '这', '那', '这些', '那些', '其', '为', '被', '由', '对', '于', '上', '下', '中', '从', '到', '以', '并', '但', '如果', '则', '而且', '因为', '所以', '而是',
      '可以', '会', '要', '又', '与', '并且', '或者', '而', '等', '等于', '比如', '例如', '即', '及其', '及', '等', '等到', '由于', '通过', '根据', '关于', '比如说',
      '其中', '此外', '另外', '而且', '但是', '不过', '虽然', '然而', '并不是', '并非', '不是', '没有', '不要', '不能', '不会', '不是', '什么', '怎么', '怎么样', '多少',
      '几', '谁', '哪', '哪里', '怎么', '怎么样', '什么样', '什么的', '什么是', '什么都', '什么也', '什么没', '什么没有', '什么不是', '什么不能', '什么不会', '什么不要'
    ];

    // 常见英文停用词（可根据需要扩展）
    const englishStopWords = [
      'the', 'and', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'up', 'about', 'than', 'after', 'before', 'over', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could', 'ought', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
      'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
      'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
      'again', 'further', 'then', 'once'
    ];

    return chineseStopWords.includes(word) ||
      englishStopWords.includes(word.toLowerCase());
  }

  // 保存文档并更新分词字典
  async saveDoc({ title, description, content, tags = [], chapterId }: { title: string; description: string; content: string; tags: string[], chapterId: number }) {
    try {
      // 分别分词
      const titleTokens = this.tokenize(title);
      const descriptionTokens = this.tokenize(description);
      const simpleContent = mdToText(content);
      const contentTokens = this.tokenize(simpleContent);
      const keywordsTokens = tags;

      // 权重：title*8, keywords*4, description*2, content*1
      // 权重分配可以更细致，比如根据实际SEO经验调整权重比例
      // 也可以考虑根据token在不同字段出现的次数分别计权
      // 过滤掉无意义的符号，但保留对分词有意义的符号
      // 保留 @ # - _ . / : 等常见有意义符号，仅过滤如逗号、句号、花括号、空格等
      const weightedTokens = [
        ...Array(10).fill(titleTokens),
        ...Array(6).fill(keywordsTokens),
        ...Array(3).fill(descriptionTokens),
        contentTokens
      ].flat().filter(token => !/^[{},，。、“”‘’"';:!?！？\s\[\]\(\)]+$/.test(token));

      // 统计词频并生成带权重关键词数组
      const freqMap: Record<string, number> = {};
      weightedTokens.forEach(token => freqMap[token] = (freqMap?.[token] || 0) + 1);

      // 可以考虑引入TF-IDF等算法提升关键词区分度
      // 也可以对不同长度的词赋予不同的基础权重（如短词降权，长词升权）
      const keywordsWithWeight = Object.entries(freqMap)
        .map(([word, weight]) => {
          // 单字降权
          if (word.length === 1 && weight > 15) {
            weight = 5 + Math.floor(Math.sqrt(weight));
          }
          // 长词适当升权
          if (word.length > 4) {
            weight += 2;
          }
          return { word, weight };
        })
        .sort((a, b) => b.weight - a.weight);;

      const tokens = keywordsWithWeight.map(k => k.word);

      let doc;
      const time = readingTime(content);
      const wordCount = wordsCount(content);
      const item = await this.docModel.findOne({ chapterId });
      if (item) {
        const { readTime, words: oldWords } = item;
        const { time: oldReadTime } = readTime as any;
        this.eventEmitter.emit("books.updateTimeAndWordCount", {
          chapterId: item.chapterId,
          readTime: time.time - oldReadTime,
          wordCount: wordCount - oldWords
        })
        doc = await this.docModel.findOneAndUpdate(
          { chapterId },
          { title, description, content: simpleContent, tags, keywords: keywordsWithWeight, chapterId, readTime: time, words: wordCount },
          { upsert: true, new: true }
        );
      } else {
        this.eventEmitter.emit("books.updateTimeAndWordCount", {
          chapterId: item.chapterId,
          readTime: time.time,
          wordCount: wordCount
        })
        doc = new this.docModel({ title, description, content: simpleContent, keywords: keywordsWithWeight, chapterId, tags, readTime: time, words: wordCount });
        await doc.save();
      }
      // 更新分词字典
      for (const word of tokens) {
        await this.dictModel.updateOne(
          { word },
          { $inc: { count: 1 } },
          { upsert: true }
        );
      }
      return doc;
    } catch (error) {
      console.log(error);
    }
  }

  // 优化搜索文档（优先全文匹配，再关键词权重相关性，提升准确度和性能）
  async search(query: string) {
    const tokens = this.tokenize(query);
    if (!query?.trim() && tokens.length === 0) return [];

    // 1. 优先查找content中包含完整query的文档
    let docs = await this.docModel.find({ content: { $search: `\"${query}\"` } }).lean();
    // console.log(docs);

    // 2. 如果没有完整匹配，再用关键词权重相关性查找
    if (docs.length === 0 && tokens.length > 0) {
      docs = await this.docModel.find({ 'keywords.word': { $in: tokens } }).lean();

      // 按匹配度和权重排序
      docs.sort((a, b) => {
        const aScore = a.keywords
          .filter((k: any) => tokens.includes(k.word))
          .reduce((sum: number, k: any) => sum + k.weight, 0);
        const bScore = b.keywords
          .filter((k: any) => tokens.includes(k.word))
          .reduce((sum: number, k: any) => sum + k.weight, 0);
        return bScore - aScore;
      });
    }

    // 只返回前10条，去掉content和keywords字段
    return docs.slice(0, 10).map(({ keywords, content, ...item }) => item);
  }

  async queryHunYuanAi(content: string, chapterId?: number) {
    try {
      const { data } = await axios("http://hunyuanapi.woa.com/openapi/v1/chat/completions",
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + 'obUTm9XlaYOLOaRXZCBEbwHQRttXy4iR',
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Host': 'hunyuanapi.woa.com',
            'Connection': 'keep-alive',
            'Cookie': 'x_host_key_access=9fc2531480079a0fbb3962df52928440f5449669_s; x-client-ssid=9210b00b:0190d91a5232:05b1b9'
          },
          data: JSON.stringify({
            "model": "hunyuan-lite-13b",
            "messages": [
              {
                "role": "user",
                "content": [
                  {
                    "type": "text",
                    "text": "你是一位资深 SEO 专家，擅长从内容中提炼核心主题并生成优化的 SEO 元数据。请基于以下文本内容生成符合搜索引擎优化标准的 TDK（标题、描述、关键词）。\n\n## 核心要求：\n1. **内容分析**：深度理解提供的 Markdown 格式文本，忽略所有格式标记、代码块等非内容元素，专注于语义核心\n2. **标题生成**：\n   - 长度严格控制在 50-60 个字符（汉字+英文）\n   - 必须包含 1-2 个核心关键词\n   - 自然融入情感触发词（如：终极指南、实战技巧、深度解析）\n3. **描述优化**：\n   - 长度精确为 150-160 个字符\n   - 包含至少 3 个相关关键词（不重复堆砌）\n   - 采用行动号召句式（如：学习…、掌握…、了解…）\n4. **关键词提取**：\n   - 提取 5-8 个最相关的关键词/短语\n   - 按搜索价值排序：核心词 > 长尾词 > 相关概念\n   - 确保关键词100%来自内容本身\n\n## 处理说明：\n- 输入内容为 Markdown 格式，但你需要：\n  ① 过滤所有代码块、公式等非文本元素\n  ② 忽略标题符号（#）、列表符号（-/*）等格式标记\n  ③ 专注于纯文本语义\n- 输出要求：\n  必须使用 JSON 格式：{\"title\": \"\", \"description\": \"\", \"keywords\": [\"\", \"\"]}\n  所有文案使用中文（禁止包含反引号`符号）\n\n## 内容输入：\n" + content
                  }
                ]
              }
            ]
          }),
          timeout: 3000000
        }
      );
      const tdk = JSON.parse(data?.choices[0]?.message.content.replace(/```(json)?/g, ''));
      if (chapterId) {
        await this.saveDoc({
          title: tdk.title,
          description: tdk.description,
          content: content,
          tags: tdk.keywords,
          chapterId
        });
      }
      return tdk;
    } catch (error) {
      return error;
    }
  }

  async findChapterById(id: number) {
    const data = await this.docModel.findOne({ chapterId: id }).lean();
    if (!data) return { keywords: null };
    delete data.content;
    return data;
  }

  async removeChapter(id: number) {
    return await this.docModel.deleteOne({ chapterId: id });
  }
}
