import { MigrationInterface, QueryRunner } from "typeorm";

export class Hito2Enhancements1781898600000 implements MigrationInterface {
    name = 'Hito2Enhancements1781898600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`visit_type\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`guests\` ADD \`age\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guests\` DROP COLUMN \`age\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`visit_type\``);
    }
}
