<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'vente')]
class Vente implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'guid', unique: true)]
    private string $id;

    #[ORM\Column(length: 32, unique: true)]
    private string $numero = '';

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $date;

    #[ORM\Column(length: 16)]
    private string $type = 'comptoir';

    #[ORM\Column(name: 'client_id', type: 'guid', nullable: true)]
    private ?string $clientId = null;

    #[ORM\Column(name: 'client_nom', length: 190)]
    private string $clientNom = '';

    #[ORM\Column(name: 'sous_total', type: 'decimal', precision: 12, scale: 2)]
    private string $sousTotal = '0.00';

    #[ORM\Column(name: 'discount_percent', type: 'decimal', precision: 5, scale: 2)]
    private string $discountPercent = '0.00';

    #[ORM\Column(name: 'discount_amount', type: 'decimal', precision: 12, scale: 2)]
    private string $discountAmount = '0.00';

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $total = '0.00';

    #[ORM\Column(name: 'mode_paiement', length: 16)]
    private string $modePaiement = 'especes';

    #[ORM\Column(name: 'montant_paye', type: 'decimal', precision: 12, scale: 2)]
    private string $montantPaye = '0.00';

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $reste = '0.00';

    #[ORM\Column(length: 16)]
    private string $statut = 'payee';

    /** @var Collection<int, VenteItem> */
    #[ORM\OneToMany(mappedBy: 'vente', targetEntity: VenteItem::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $items;

    public function __construct()
    {
        $this->id    = Uuid::v4()->toRfc4122();
        $this->date  = new \DateTimeImmutable();
        $this->items = new ArrayCollection();
    }

    public function getId(): string { return $this->id; }
    public function getNumero(): string { return $this->numero; }
    public function setNumero(string $v): self { $this->numero = $v; return $this; }
    public function getDate(): \DateTimeImmutable { return $this->date; }
    public function getType(): string { return $this->type; }
    public function setType(string $v): self { $this->type = $v; return $this; }
    public function getClientId(): ?string { return $this->clientId; }
    public function setClientId(?string $v): self { $this->clientId = $v; return $this; }
    public function getClientNom(): string { return $this->clientNom; }
    public function setClientNom(string $v): self { $this->clientNom = $v; return $this; }
    public function getSousTotal(): float { return (float) $this->sousTotal; }
    public function setSousTotal(float $v): self { $this->sousTotal = number_format($v, 2, '.', ''); return $this; }
    public function getDiscountPercent(): float { return (float) $this->discountPercent; }
    public function setDiscountPercent(float $v): self { $this->discountPercent = number_format($v, 2, '.', ''); return $this; }
    public function getDiscountAmount(): float { return (float) $this->discountAmount; }
    public function setDiscountAmount(float $v): self { $this->discountAmount = number_format($v, 2, '.', ''); return $this; }
    public function getTotal(): float { return (float) $this->total; }
    public function setTotal(float $v): self { $this->total = number_format($v, 2, '.', ''); return $this; }
    public function getModePaiement(): string { return $this->modePaiement; }
    public function setModePaiement(string $v): self { $this->modePaiement = $v; return $this; }
    public function getMontantPaye(): float { return (float) $this->montantPaye; }
    public function setMontantPaye(float $v): self { $this->montantPaye = number_format($v, 2, '.', ''); return $this; }
    public function getReste(): float { return (float) $this->reste; }
    public function setReste(float $v): self { $this->reste = number_format($v, 2, '.', ''); return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $v): self { $this->statut = $v; return $this; }
    public function getItems(): Collection { return $this->items; }
    public function addItem(VenteItem $item): self { $item->setVente($this); $this->items->add($item); return $this; }

    public function jsonSerialize(): array
    {
        return [
            'id'              => $this->id,
            'numero'          => $this->numero,
            'date'            => $this->date->format(\DateTimeInterface::ATOM),
            'type'            => $this->type,
            'clientId'        => $this->clientId,
            'clientNom'       => $this->clientNom,
            'items'           => $this->items->map(fn(VenteItem $i) => $i->jsonSerialize())->toArray(),
            'sousTotal'       => (float) $this->sousTotal,
            'discountPercent' => (float) $this->discountPercent,
            'discountAmount'  => (float) $this->discountAmount,
            'total'           => (float) $this->total,
            'modePaiement'    => $this->modePaiement,
            'montantPaye'     => (float) $this->montantPaye,
            'reste'           => (float) $this->reste,
            'statut'          => $this->statut,
        ];
    }
}
