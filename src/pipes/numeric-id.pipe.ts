import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class NumericIdPipe implements PipeTransform<string, number> {
    transform(value: string, metadata: ArgumentMetadata): number {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 1) {
            throw new BadRequestException(`Invalid id: '${value}'. Must be a numeric value >= 1.`);
        }
        return numericValue;
    }
}