import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781668353815 implements MigrationInterface {
    name = 'InitialSchema1781668353815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`spaces\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`max_capacity\` int NOT NULL, \`base_price\` int NOT NULL, \`socio_price\` int NOT NULL, \`guest_price\` int NOT NULL, \`free_guests_for_socio\` int NOT NULL DEFAULT '0', \`images\` text NOT NULL, \`amenities\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`rut\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`bookingId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bookings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`booking_code\` varchar(255) NOT NULL, \`check_in\` varchar(255) NOT NULL, \`check_out\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`total_amount\` int NOT NULL, \`receipt_url\` varchar(255) NULL, \`admin_notes\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`price_breakdown\` text NOT NULL, \`userId\` int NULL, \`spaceId\` int NULL, UNIQUE INDEX \`IDX_796e0227e4beff186bdd72ac53\` (\`booking_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`rut\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, \`ficha_number\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`password_hash\` varchar(255) NULL, UNIQUE INDEX \`IDX_7a822393037d08be61bed48944\` (\`rut\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`announcements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`body\` text NOT NULL, \`image_url\` varchar(255) NULL, \`published_at\` varchar(255) NOT NULL, \`is_pinned\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`guests\` ADD CONSTRAINT \`FK_b78c3c5798a82a7c9b71305f245\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_38a69a58a323647f2e75eb994de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_74215391af3858ab347890c3287\` FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_74215391af3858ab347890c3287\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_38a69a58a323647f2e75eb994de\``);
        await queryRunner.query(`ALTER TABLE \`guests\` DROP FOREIGN KEY \`FK_b78c3c5798a82a7c9b71305f245\``);
        await queryRunner.query(`DROP TABLE \`announcements\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a822393037d08be61bed48944\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_796e0227e4beff186bdd72ac53\` ON \`bookings\``);
        await queryRunner.query(`DROP TABLE \`bookings\``);
        await queryRunner.query(`DROP TABLE \`guests\``);
        await queryRunner.query(`DROP TABLE \`spaces\``);
    }

}
