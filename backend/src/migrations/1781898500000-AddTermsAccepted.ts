import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTermsAccepted1781898500000 implements MigrationInterface {
    name = 'AddTermsAccepted1781898500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`terms_accepted\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`terms_accepted\``);
    }
}
