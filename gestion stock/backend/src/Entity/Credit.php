<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'credit')]
class Credit implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid', unique: true)]
    private string $id;

    #[ORM\Column(name: 'client_id', type: 'guid')]
    private string $clientId;

    #[ORM\Column(name: 'client_nom', length: 190)]
    private string $clientNom = '';

    #[ORM\Column(name: 'vente_id', type: 'guid')]
    private string $venteId;

    #[ORM\Column(name: 'vente_numero', length: 32)]
    private string $venteNumero = '';

    #[ORM\Column(name: 'montant_total', type: 'decimal', precision: 12, scale: 2)]
    private string $montantTotal = '0.00';

    #[ORM\Column(name: 'montant_paye', type: 'decimal', precision: 12, scale: 2)]
    private string $montantPaye = '0.00';

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $date;

    #[ORM\Column(length: 16)]
    private string $statut = 'ouvert';

    /** @var Collection<int, PaiementCredit> */
    #[ORM\OneToMany(mappedBy: 'credit', targetEntity: PaiementCredit::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['date' => 'ASC'])]
    private Collection $paiements;

    public function __construct()
    {
        $this->id        = Uuid::v4()->toRfc4122();
        $this->clientId  = Uuid::v4()->toRfc4122();
        $this->venteId   = Uuid::v4()->toRfc4122();
        $this->date      = new \DateTimeImmutable();
        $this->paiements = new ArrayCollection();
    }

    public function getId(): string { return $this->id; }
    public function getClientId(): string { return $this->clientId; }
    public function setClientId(string $v): self { $this->clientId = $v; return $this; }
    public function getClientNom(): string { return $this->clientNom; }
    public function setClientNom(string $v): self { $this->clientNom = $v; return $this; }
    public function getVenteId(): string { return $this->venteId; }
    public function setVenteId(string $v): self { $this->venteId = $v; return $this; }
    public function getVenteNumero(): string { return $this->venteNumero; }
    public function setVenteNumero(string $v): self { $this->venteNumero = $v; return $this; }
    public function getMontantTotal(): float { return (float) $this->montantTotal; }
    public function setMontantTotal(float $v): self { $this->montantTotal = number_format($v, 2, '.', ''); return $this; }
    public function getMontantPaye(): float { return (float) $this->montantPaye; }
    public function setMontantPaye(float $v): self { $this->montantPaye = number_format($v, 2, '.', ''); return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $v): self { $this->statut = $v; return $this; }
    public function getPaiements(): Collection { return $this->paiements; }
    public function addPaiement(PaiementCredit $p): self { $p->setCredit($this); $this->paiements->add($p); return $this; }

    public function jsonSerialize(): array
    {
        return [
            'id'           => $this->id,
            'clientId'     => $this->clientId,
            'clientNom'    => $this->clientNom,
            'venteId'      => $this->venteId,
            'venteNumero'  => $this->venteNumero,
            'montantTotal' => (float) $this->montantTotal,
            'montantPaye'  => (float) $this->montantPaye,
            'date'         => $this->date->format(\DateTimeInterface::ATOM),
            'paiements'    => $this->paiements->map(fn(PaiementCredit $p) => $p->jsonSerialize())->toArray(),
            'statut'       => $this->statut,
        ];
    }
}
