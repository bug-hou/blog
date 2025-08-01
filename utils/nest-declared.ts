import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import * as path from 'path';

// 验证器约束实现
@ValidatorConstraint({ name: 'isValidPath' })
export class IsValidPathConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      // 检查路径是否有效
      const normalizedPath = path.normalize(value);

      // 检查路径是否包含非法字符（根据需求调整）
      const illegalChars = /[<>:"|?*\x00-\x1F]/;
      if (illegalChars.test(normalizedPath)) {
        return false;
      }

      // 检查路径是否为绝对路径（可选）
      if (args.constraints && args.constraints[0] === 'absolute' && !path.isAbsolute(normalizedPath)) {
        return false;
      }

      // 检查路径是否为相对路径（可选）
      if (args.constraints && args.constraints[0] === 'relative' && path.isAbsolute(normalizedPath)) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [pathType] = args.constraints;
    if (pathType === 'absolute') {
      return '路径必须是绝对路径';
    }
    if (pathType === 'relative') {
      return '路径必须是相对路径';
    }
    return '提供的路径无效';
  }
}
