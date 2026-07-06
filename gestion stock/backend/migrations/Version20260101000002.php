<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add type_paiement column to paiement_credit table.
 * This migration is safe to run on existing databases.
 */
final class Version20260101000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add type_paiement (especes|cheque|carte) to paiement_credit';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE paiement_credit ADD COLUMN type_paiement VARCHAR(16) NOT NULL DEFAULT 'especes'");
    }

    public function down(Schema $schema): void
    {
        // SQLite does not support DROP COLUMN; skip for now
        // For MySQL: $this->addSql('ALTER TABLE paiement_credit DROP COLUMN type_paiement');
    }
}
