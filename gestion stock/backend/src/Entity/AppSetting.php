<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Single-row entity that stores the global application/company settings.
 */
#[ORM\Entity]
#[ORM\Table(name: 'app_setting')]
class AppSetting implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    private int $id = 1;

    #[ORM\Column(length: 190)]
    private string $nom = 'StockPro';

    #[ORM\Column(length: 60, nullable: true)]
    private ?string $tel = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $addr = null;

    #[ORM\Column(length: 190, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(length: 60, nullable: true)]
    private ?string $ice = null;

    public function getNom(): string { return $this->nom; }
    public function setNom(string $v): self { $this->nom = $v; return $this; }
    public function getTel(): ?string { return $this->tel; }
    public function setTel(?string $v): self { $this->tel = $v; return $this; }
    public function getAddr(): ?string { return $this->addr; }
    public function setAddr(?string $v): self { $this->addr = $v; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $v): self { $this->email = $v; return $this; }
    public function getIce(): ?string { return $this->ice; }
    public function setIce(?string $v): self { $this->ice = $v; return $this; }

    public function jsonSerialize(): array
    {
        return [
            'nom' => $this->nom,
            'tel' => $this->tel,
            'addr' => $this->addr,
            'email' => $this->email,
            'ice' => $this->ice,
        ];
    }
}
