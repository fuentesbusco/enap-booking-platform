import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPhoneFeedbackAndFaq1781898400000 implements MigrationInterface {
    name = 'UserPhoneFeedbackAndFaq1781898400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Añadir columna 'phone' a la tabla 'users'
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone\` varchar(255) NULL`);

        // 2. Crear tabla 'feedbacks'
        await queryRunner.query(`
            CREATE TABLE \`feedbacks\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`rating\` int NOT NULL,
                \`comment\` text NOT NULL,
                \`status\` varchar(255) NOT NULL DEFAULT 'pending_approval',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`bookingId\` int NULL,
                \`userId\` int NULL,
                \`spaceId\` int NULL,
                UNIQUE INDEX \`REL_feedbacks_booking\` (\`bookingId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 3. Crear tabla 'faqs'
        await queryRunner.query(`
            CREATE TABLE \`faqs\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`question\` varchar(255) NOT NULL,
                \`answer\` text NOT NULL,
                \`order\` int NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 4. Agregar llaves foráneas a 'feedbacks'
        await queryRunner.query(`
            ALTER TABLE \`feedbacks\` 
            ADD CONSTRAINT \`FK_feedbacks_booking\` 
            FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`feedbacks\` 
            ADD CONSTRAINT \`FK_feedbacks_user\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`feedbacks\` 
            ADD CONSTRAINT \`FK_feedbacks_space\` 
            FOREIGN KEY (\`spaceId\`) REFERENCES \`spaces\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Eliminar llaves foráneas
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_feedbacks_space\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_feedbacks_user\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_feedbacks_booking\``);

        // 2. Eliminar tablas
        await queryRunner.query(`DROP TABLE \`faqs\``);
        await queryRunner.query(`DROP TABLE \`feedbacks\``);

        // 3. Eliminar columna 'phone' de 'users'
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone\``);
    }
}
