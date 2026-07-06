<?php

namespace App\Controller;

use App\Entity\Credit;
use App\Entity\Produit;
use App\Entity\Vente;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stats')]
class StatsController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $ventes = $this->em->getRepository(Vente::class)->findAll();
        $produits = $this->em->getRepository(Produit::class)->findAll();
        $credits = $this->em->getRepository(Credit::class)->findAll();

        $chiffreAffaires = array_sum(array_map(fn(Vente $v) => $v->getTotal(), $ventes));
        $valeurStock = array_sum(array_map(fn(Produit $p) => $p->getQuantite() * $p->getPrixAchat(), $produits));
        $creditsEnCours = array_sum(array_map(
            fn(Credit $c) => $c->getStatut() === 'ouvert' ? ($c->getMontantTotal() - $c->getMontantPaye()) : 0,
            $credits
        ));
        $lowStock = array_values(array_filter($produits, fn(Produit $p) => $p->getQuantite() <= $p->getStockMin()));

        return new JsonResponse([
            'chiffreAffaires' => $chiffreAffaires,
            'valeurStock' => $valeurStock,
            'creditsEnCours' => $creditsEnCours,
            'nbVentes' => count($ventes),
            'nbProduits' => count($produits),
            'lowStock' => $lowStock,
        ]);
    }
}
