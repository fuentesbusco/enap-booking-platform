import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThirdPartyColumns1781811107712 implements MigrationInterface {
    name = 'AddThirdPartyColumns1781811107712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`is_for_third_party\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`third_party_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`third_party_rut\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`third_party_phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`admin_created_for_external\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`phone\` \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`bookingId\` \`bookingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`receipt_url\` \`receipt_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`admin_notes\` \`admin_notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`spaceId\` \`spaceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`ficha_number\` \`ficha_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password_hash\` \`password_hash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`announcements\` CHANGE \`image_url\` \`image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`guests\` ADD CONSTRAINT \`FK_b78c3c5798a82a7c9b71305f245\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_38a69a58a323647f2e75eb994de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_74215391af3858ab347890c3287\` FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_74215391af3858ab347890c3287\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_38a69a58a323647f2e75eb994de\``);
        await queryRunner.query(`ALTER TABLE \`guests\` DROP FOREIGN KEY \`FK_b78c3c5798a82a7c9b71305f245\``);
        await queryRunner.query(`ALTER TABLE \`announcements\` CHANGE \`image_url\` \`image_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password_hash\` \`password_hash\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`ficha_number\` \`ficha_number\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`spaceId\` \`spaceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`admin_notes\` \`admin_notes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`receipt_url\` \`receipt_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`bookingId\` \`bookingId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`phone\` \`phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`admin_created_for_external\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`third_party_phone\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`third_party_rut\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`third_party_name\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`is_for_third_party\``);
    }

}
