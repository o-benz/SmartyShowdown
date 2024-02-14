import { ApiProperty } from '@nestjs/swagger';

export class Message {
    @ApiProperty({ example: 'Mon Message' })
    title: string;
    @ApiProperty({ example: 'Je suis envoyé à partir de la documentation!' })
    body: string;
}
