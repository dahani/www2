<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'paiement_credit')]
class PaiementCredit implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid', unique: true)]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Credit::class, inversedBy: 'paiements')]
    #[ORM\JoinColumn(name: 'credit_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ?Credit $credit = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $date;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $montant = '0.00';

    #[ORM\Column(name: 'type_paiement', length: 16)]
    private string $typePaiement = 'especes';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $note = null;

    public function __construct()
    {
        $this->id   = Uuid::v4()->toRfc4122();
        $this->date = new \DateTimeImmutable();
    }

    public function setCredit(Credit $c): self { $this->credit = $c; return $this; }
    public function getMontant(): float { return (float) $this->montant; }
    public function setMontant(float $v): self { $this->montant = number_format($v, 2, '.', ''); return $this; }
    public function getTypePaiement(): string { return $this->typePaiement; }
    public function setTypePaiement(string $v): self { $this->typePaiement = $v; return $this; }
    public function getNote(): ?string { return $this->note; }
    public function setNote(?string $v): self { $this->note = $v; return $this; }

    public function jsonSerialize(): array
    {
        return [
            'id'           => $this->id,
            'date'         => $this->date->format(\DateTimeInterface::ATOM),
            'montant'      => (float) $this->montant,
            'typePaiement' => $this->typePaiement,
            'note'         => $this->note,
        ];
    }
}
