<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'vente_item')]
class VenteItem implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid', unique: true)]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Vente::class, inversedBy: 'items')]
    #[ORM\JoinColumn(name: 'vente_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ?Vente $vente = null;

    #[ORM\Column(name: 'produit_id', type: 'guid')]
    private string $produitId;

    #[ORM\Column(length: 190)]
    private string $nom = '';

    #[ORM\Column(name: 'code_barre', length: 60, nullable: true)]
    private ?string $codeBarre = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $prix = '0.00';

    #[ORM\Column(type: 'integer')]
    private int $quantite = 1;

    public function __construct()
    {
        $this->id        = Uuid::v4()->toRfc4122();
        $this->produitId = Uuid::v4()->toRfc4122();
    }

    public function setVente(Vente $v): self { $this->vente = $v; return $this; }
    public function getProduitId(): string { return $this->produitId; }
    public function setProduitId(string $v): self { $this->produitId = $v; return $this; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $v): self { $this->nom = $v; return $this; }
    public function getCodeBarre(): ?string { return $this->codeBarre; }
    public function setCodeBarre(?string $v): self { $this->codeBarre = $v; return $this; }
    public function getPrix(): float { return (float) $this->prix; }
    public function setPrix(float $v): self { $this->prix = number_format($v, 2, '.', ''); return $this; }
    public function getQuantite(): int { return $this->quantite; }
    public function setQuantite(int $v): self { $this->quantite = max(1, $v); return $this; }

    public function jsonSerialize(): array
    {
        return [
            'produitId'  => $this->produitId,
            'nom'        => $this->nom,
            'codeBarre'  => $this->codeBarre,
            'prix'       => (float) $this->prix,
            'quantite'   => $this->quantite,
        ];
    }
}
