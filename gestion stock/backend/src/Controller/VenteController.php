<?php

namespace App\Controller;

use App\Entity\Credit;
use App\Entity\PaiementCredit;
use App\Entity\Produit;
use App\Entity\Vente;
use App\Entity\VenteItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/ventes')]
class VenteController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    /**
     * Paginated list of ventes.
     * GET /api/ventes?page=1&limit=20
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $r): JsonResponse
    {
        $page  = max(1, (int)$r->query->get('page', 1));
        $limit = min(100, max(1, (int)$r->query->get('limit', 20)));

        $qb = $this->em->createQueryBuilder()
            ->select('v')
            ->from(Vente::class, 'v')
            ->orderBy('v.date', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        $ventes = $qb->getQuery()->getResult();
        $total  = (int)$this->em->createQuery('SELECT COUNT(v.id) FROM App\Entity\Vente v')->getSingleScalarResult();

        return new JsonResponse([
            'data'  => $ventes,
            'total' => $total,
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    /** GET /api/ventes/{id} */
    #[Route('/{id}', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        $vente = $this->em->getRepository(Vente::class)->find($id);
        if (!$vente) return new JsonResponse(['error' => 'Introuvable'], 404);
        return new JsonResponse($vente);
    }

    /** POST /api/ventes */
    #[Route('', methods: ['POST'])]
    public function create(Request $r): JsonResponse
    {
        $data = json_decode($r->getContent(), true) ?? [];
        if (empty($data['items']) || !is_array($data['items'])) {
            return new JsonResponse(['error' => 'Le panier est vide'], 422);
        }

        $vente = new Vente();
        $vente->setType($data['type'] ?? 'comptoir');
        $vente->setClientId($data['clientId'] ?? null);
        $vente->setClientNom($data['clientNom'] ?? 'Client comptoir');
        $vente->setModePaiement($data['modePaiement'] ?? 'especes');

        $sousTotal = 0.0;
        foreach ($data['items'] as $it) {
            $item = new VenteItem();
            $item->setProduitId($it['produitId']);
            $item->setNom($it['nom']);
            $item->setCodeBarre($it['codeBarre'] ?? null);
            $item->setPrix((float)$it['prix']);
            $item->setQuantite((int)$it['quantite']);
            $vente->addItem($item);
            $sousTotal += (float)$it['prix'] * (int)$it['quantite'];

            // Decrement stock
            $produit = $this->em->getRepository(Produit::class)->find($it['produitId']);
            if ($produit) $produit->decrementStock((int)$it['quantite']);
        }

        $discountPercent = max(0, min(100, (float)($data['discountPercent'] ?? 0)));
        $discountAmount  = max(0, (float)($data['discountAmount'] ?? 0));
        $total      = max(0, $sousTotal - ($sousTotal * $discountPercent / 100) - $discountAmount);
        $montantPaye = min((float)($data['montantPaye'] ?? $total), $total);
        $reste       = max(0, $total - $montantPaye);

        $statut = 'payee';
        if ($vente->getModePaiement() === 'credit' && $reste > 0) {
            $statut = $reste == $total ? 'impayee' : 'partielle';
        } elseif ($reste > 0) {
            $statut = 'partielle';
        }

        $vente->setSousTotal($sousTotal)
            ->setDiscountPercent($discountPercent)
            ->setDiscountAmount($discountAmount)
            ->setTotal($total)
            ->setMontantPaye($montantPaye)
            ->setReste($reste)
            ->setStatut($statut);

        $count = (int) $this->em->createQuery('SELECT COUNT(v.id) FROM App\Entity\Vente v')->getSingleScalarResult();
        $vente->setNumero(sprintf('FA-%05d', $count + 1));

        $this->em->persist($vente);

        // Create credit if applicable
        if ($reste > 0 && $vente->getClientId()) {
            $credit = new Credit();
            $credit->setClientId($vente->getClientId())
                ->setClientNom($vente->getClientNom())
                ->setVenteId($vente->getId())
                ->setVenteNumero($vente->getNumero())
                ->setMontantTotal($total)
                ->setMontantPaye($montantPaye)
                ->setStatut('ouvert');
            if ($montantPaye > 0) {
                $p = new PaiementCredit();
                $p->setMontant($montantPaye)->setTypePaiement($data['modePaiement'] ?? 'especes')->setNote('Paiement initial');
                $credit->addPaiement($p);
            }
            $this->em->persist($credit);
        }

        $this->em->flush();
        return new JsonResponse($vente, 201);
    }

    /** DELETE /api/ventes/{id} */
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $vente = $this->em->getRepository(Vente::class)->find($id);
        if (!$vente) return new JsonResponse(['error' => 'Introuvable'], 404);
        $this->em->remove($vente);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
