<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'produit')]
class Produit implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid', unique: true)]
    private string $id;

    #[ORM\Column(length: 190)]
    private string $nom = '';

    #[ORM\Column(name: 'code_barre', length: 60, nullable: true)]
    private ?string $codeBarre = null;

    #[ORM\Column(type: 'integer')]
    private int $quantite = 0;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $prix = '0.00';

    #[ORM\Column(name: 'prix_achat', type: 'decimal', precision: 10, scale: 2)]
    private string $prixAchat = '0.00';

    #[ORM\Column(length: 60, nullable: true)]
    private ?string $couleur = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 3)]
    private string $poids = '0.000';

    #[ORM\Column(name: 'stock_min', type: 'integer')]
    private int $stockMin = 0;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $categorie = null;

    #[ORM\Column(name: 'fournisseur_id', type: 'guid', nullable: true)]
    private ?string $fournisseurId = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->id = Uuid::v4()->toRfc4122();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): string { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $v): self { $this->nom = $v; return $this; }
    public function getCodeBarre(): ?string { return $this->codeBarre; }
    public function setCodeBarre(?string $v): self { $this->codeBarre = $v; return $this; }
    public function getQuantite(): int { return $this->quantite; }
    public function setQuantite(int $v): self { $this->quantite = max(0, $v); return $this; }
    public function getPrix(): float { return (float) $this->prix; }
    public function setPrix(float $v): self { $this->prix = number_format($v, 2, '.', ''); return $this; }
    public function getPrixAchat(): float { return (float) $this->prixAchat; }
    public function setPrixAchat(float $v): self { $this->prixAchat = number_format($v, 2, '.', ''); return $this; }
    public function getCouleur(): ?string { return $this->couleur; }
    public function setCouleur(?string $v): self { $this->couleur = $v; return $this; }
    public function getPoids(): float { return (float) $this->poids; }
    public function setPoids(float $v): self { $this->poids = number_format($v, 3, '.', ''); return $this; }
    public function getStockMin(): int { return $this->stockMin; }
    public function setStockMin(int $v): self { $this->stockMin = max(0, $v); return $this; }
    public function getCategorie(): ?string { return $this->categorie; }
    public function setCategorie(?string $v): self { $this->categorie = $v; return $this; }
    public function getFournisseurId(): ?string { return $this->fournisseurId; }
    public function setFournisseurId(?string $v): self { $this->fournisseurId = $v; return $this; }

    public function decrementStock(int $qty): void
    {
        $this->quantite = max(0, $this->quantite - $qty);
    }

    public function jsonSerialize(): array
    {
        return [
            'id'            => $this->id,
            'nom'           => $this->nom,
            'codeBarre'     => $this->codeBarre,
            'quantite'      => $this->quantite,
            'prix'          => (float) $this->prix,
            'prixAchat'     => (float) $this->prixAchat,
            'couleur'       => $this->couleur,
            'poids'         => (float) $this->poids,
            'stockMin'      => $this->stockMin,
            'categorie'     => $this->categorie,
            'fournisseurId' => $this->fournisseurId,
            'createdAt'     => $this->createdAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
