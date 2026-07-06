<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Initial empty schema for StockPro (Symfony 8 / Doctrine DBAL 4 / ORM 3).
 *
 * UUID columns are stored as VARCHAR(36) — compatible with SQLite, MySQL 8
 * and PostgreSQL without requiring any DB-specific extension.
 * Decimal columns use NUMERIC(p,s) which is ANSI SQL and works everywhere.
 */
final class Version20260101000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial empty schema — fournisseur, client, produit, vente, vente_item, credit, paiement_credit, app_setting';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE fournisseur (
            id VARCHAR(36) NOT NULL,
            nom VARCHAR(190) NOT NULL,
            tel VARCHAR(60) DEFAULT NULL,
            email VARCHAR(190) DEFAULT NULL,
            ice VARCHAR(60) DEFAULT NULL,
            addr CLOB DEFAULT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE TABLE client (
            id VARCHAR(36) NOT NULL,
            nom VARCHAR(190) NOT NULL,
            tel VARCHAR(60) DEFAULT NULL,
            email VARCHAR(190) DEFAULT NULL,
            addr CLOB DEFAULT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE TABLE produit (
            id VARCHAR(36) NOT NULL,
            nom VARCHAR(190) NOT NULL,
            code_barre VARCHAR(60) DEFAULT NULL,
            quantite INTEGER NOT NULL,
            prix NUMERIC(10,2) NOT NULL,
            prix_achat NUMERIC(10,2) NOT NULL,
            couleur VARCHAR(60) DEFAULT NULL,
            poids NUMERIC(10,3) NOT NULL,
            stock_min INTEGER NOT NULL,
            categorie VARCHAR(120) DEFAULT NULL,
            fournisseur_id VARCHAR(36) DEFAULT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX idx_produit_code_barre ON produit (code_barre)');

        $this->addSql('CREATE TABLE vente (
            id VARCHAR(36) NOT NULL,
            numero VARCHAR(32) NOT NULL,
            date DATETIME NOT NULL,
            type VARCHAR(16) NOT NULL,
            client_id VARCHAR(36) DEFAULT NULL,
            client_nom VARCHAR(190) NOT NULL,
            sous_total NUMERIC(12,2) NOT NULL,
            discount_percent NUMERIC(5,2) NOT NULL,
            discount_amount NUMERIC(12,2) NOT NULL,
            total NUMERIC(12,2) NOT NULL,
            mode_paiement VARCHAR(16) NOT NULL,
            montant_paye NUMERIC(12,2) NOT NULL,
            reste NUMERIC(12,2) NOT NULL,
            statut VARCHAR(16) NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX uniq_vente_numero ON vente (numero)');

        $this->addSql('CREATE TABLE vente_item (
            id VARCHAR(36) NOT NULL,
            vente_id VARCHAR(36) NOT NULL,
            produit_id VARCHAR(36) NOT NULL,
            nom VARCHAR(190) NOT NULL,
            code_barre VARCHAR(60) DEFAULT NULL,
            prix NUMERIC(10,2) NOT NULL,
            quantite INTEGER NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT fk_vente_item_vente FOREIGN KEY (vente_id) REFERENCES vente (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX idx_vente_item_vente_id ON vente_item (vente_id)');

        $this->addSql('CREATE TABLE credit (
            id VARCHAR(36) NOT NULL,
            client_id VARCHAR(36) NOT NULL,
            client_nom VARCHAR(190) NOT NULL,
            vente_id VARCHAR(36) NOT NULL,
            vente_numero VARCHAR(32) NOT NULL,
            montant_total NUMERIC(12,2) NOT NULL,
            montant_paye NUMERIC(12,2) NOT NULL,
            date DATETIME NOT NULL,
            statut VARCHAR(16) NOT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE TABLE paiement_credit (
            id VARCHAR(36) NOT NULL,
            credit_id VARCHAR(36) NOT NULL,
            date DATETIME NOT NULL,
            montant NUMERIC(12,2) NOT NULL,
            note CLOB DEFAULT NULL,
            PRIMARY KEY(id),
            CONSTRAINT fk_paiement_credit_credit FOREIGN KEY (credit_id) REFERENCES credit (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX idx_paiement_credit_credit_id ON paiement_credit (credit_id)');

        $this->addSql('CREATE TABLE app_setting (
            id INTEGER NOT NULL,
            nom VARCHAR(190) NOT NULL,
            tel VARCHAR(60) DEFAULT NULL,
            addr CLOB DEFAULT NULL,
            email VARCHAR(190) DEFAULT NULL,
            ice VARCHAR(60) DEFAULT NULL,
            PRIMARY KEY(id)
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS paiement_credit');
        $this->addSql('DROP TABLE IF EXISTS credit');
        $this->addSql('DROP TABLE IF EXISTS vente_item');
        $this->addSql('DROP TABLE IF EXISTS vente');
        $this->addSql('DROP TABLE IF EXISTS produit');
        $this->addSql('DROP TABLE IF EXISTS client');
        $this->addSql('DROP TABLE IF EXISTS fournisseur');
        $this->addSql('DROP TABLE IF EXISTS app_setting');
    }
}
