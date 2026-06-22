import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingAdditionalEmail1782157912950 implements MigrationInterface {
    name = 'BookingAdditionalEmail1782157912950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_feedbacks_booking\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_feedbacks_space\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_feedbacks_user\``);
        await queryRunner.query(`DROP INDEX \`REL_feedbacks_booking\` ON \`feedbacks\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD \`additional_email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`guests\` DROP FOREIGN KEY \`FK_b78c3c5798a82a7c9b71305f245\``);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`phone\` \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`age\` \`age\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`bookingId\` \`bookingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_38a69a58a323647f2e75eb994de\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_74215391af3858ab347890c3287\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`receipt_url\` \`receipt_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`admin_notes\` \`admin_notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`third_party_name\` \`third_party_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`third_party_rut\` \`third_party_rut\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`third_party_phone\` \`third_party_phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`visit_type\` \`visit_type\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`spaceId\` \`spaceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`ficha_number\` \`ficha_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password_hash\` \`password_hash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`announcements\` CHANGE \`image_url\` \`image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` CHANGE \`bookingId\` \`bookingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD UNIQUE INDEX \`IDX_e9abd598054e0244560ddde126\` (\`bookingId\`)`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` CHANGE \`spaceId\` \`spaceId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_e9abd598054e0244560ddde126\` ON \`feedbacks\` (\`bookingId\`)`);
        await queryRunner.query(`ALTER TABLE \`guests\` ADD CONSTRAINT \`FK_b78c3c5798a82a7c9b71305f245\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_38a69a58a323647f2e75eb994de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_74215391af3858ab347890c3287\` FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_e9abd598054e0244560ddde1261\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_e9b6450d76be18b05b5f09d577b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_69b868489596471fd8229117425\` FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_69b868489596471fd8229117425\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_e9b6450d76be18b05b5f09d577b\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_e9abd598054e0244560ddde1261\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_74215391af3858ab347890c3287\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_38a69a58a323647f2e75eb994de\``);
        await queryRunner.query(`ALTER TABLE \`guests\` DROP FOREIGN KEY \`FK_b78c3c5798a82a7c9b71305f245\``);
        await queryRunner.query(`DROP INDEX \`REL_e9abd598054e0244560ddde126\` ON \`feedbacks\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` CHANGE \`spaceId\` \`spaceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP INDEX \`IDX_e9abd598054e0244560ddde126\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` CHANGE \`bookingId\` \`bookingId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`announcements\` CHANGE \`image_url\` \`image_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password_hash\` \`password_hash\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`ficha_number\` \`ficha_number\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`spaceId\` \`spaceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`visit_type\` \`visit_type\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`third_party_phone\` \`third_party_phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`third_party_rut\` \`third_party_rut\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`third_party_name\` \`third_party_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`admin_notes\` \`admin_notes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` CHANGE \`receipt_url\` \`receipt_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_74215391af3858ab347890c3287\` FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_38a69a58a323647f2e75eb994de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`bookingId\` \`bookingId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`age\` \`age\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`guests\` CHANGE \`phone\` \`phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`guests\` ADD CONSTRAINT \`FK_b78c3c5798a82a7c9b71305f245\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`additional_email\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_feedbacks_booking\` ON \`feedbacks\` (\`bookingId\`)`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_feedbacks_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_feedbacks_space\` FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_feedbacks_booking\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
