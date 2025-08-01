import { Body, Controller, Get, Post } from '@nestjs/common';
import { TextAnalysisService } from './text-analysis.service';
import { QueryHunYuanAiDto, SaveDocDto, SearchDto } from './text-analysis.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('text-analysis')
@Controller('text-analysis')
export class TextAnalysisController {
  constructor(private readonly textAnalysisService: TextAnalysisService) { }

  @ApiOperation({ summary: 'Save a document' })
  @ApiResponse({ status: 201, description: 'The document has been successfully saved.' })
  @Post('save')
  async saveDoc(@Body() body: SaveDocDto) {
    return this.textAnalysisService.saveDoc(body);
  }

  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({ status: 200, description: 'Returns search results.' })
  @Post('search')
  async search(@Body() body: SearchDto) {
    return this.textAnalysisService.search(body.query);
  }

  @ApiOperation({ summary: 'Query HunYuan AI' })
  @ApiResponse({ status: 200, description: 'Returns AI response.' })
  @Post("tdk")
  async queryHunYuanAi(@Body() { content, chapterId }: QueryHunYuanAiDto) {
    return this.textAnalysisService.queryHunYuanAi(content, chapterId);
  }

  @Get("findChapterById")
  @ApiOperation({ summary: 'Find chapter by ID' })
  @ApiResponse({ status: 200, description: 'Returns the chapter details.' })
  async findChapterById(@Body('chapterId') chapterId: number) {
    return this.textAnalysisService.findChapterById(chapterId);
  }

  // @Post("updateChapter")
  // @ApiOperation({ summary: 'Update chapter' })
  // @ApiResponse({ status: 200, description: 'Chapter updated successfully.' })
  // async updateChapter(@Body() body: SaveDocDto) {
  //   return this.textAnalysisService.updateChapter(body);
  // }
}
