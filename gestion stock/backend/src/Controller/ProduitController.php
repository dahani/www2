<?php

namespace App\Controller;

use App\Entity\Produit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/produits')]
class ProduitController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    /**
     * Paginated + searched product list.
     *
     * GET /api/produits?page=1&limit=20&q=shirt&stock=bas|rupture
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $r): JsonResponse
    {
        $page  = max(1, (int)$r->query->get('page', 1));
        $limit = min(200, max(1, (int)$r->query->get('limit', 20)));
        $q     = trim((string)$r->query->get('q', ''));
        $stock = trim((string)$r->query->get('stock', ''));

        $qb = $this->em->createQueryBuilder()
            ->select('p')
            ->from(Produit::class, 'p');

        if ($q !== '') {
            $like = '%' . addcslashes($q, '%_') . '%';
            $qb->andWhere(
                'LOWER(p.nom) LIKE LOWER(:q)
              OR p.codeBarre LIKE :q
              OR LOWER(p.categorie) LIKE LOWER(:q)'
            )->setParameter('q', $like);
        }

        if ($stock === 'bas') {
            $qb->andWhere('p.quantite > 0 AND p.quantite <= p.stockMin');
        } elseif ($stock === 'rupture') {
            $qb->andWhere('p.quantite = 0');
        }

        // Count before pagination
        $countQb = clone $qb;
        $total   = (int)$countQb->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

        $produits = $qb
            ->select('p')
            ->orderBy('p.nom', 'ASC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return new JsonResponse([
            'data'  => $produits,
            'total' => $total,
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * Full flat list — used by the POS (needs all products for the grid + barcode scanner).
     * GET /api/produits/all
     */
    #[Route('/all', methods: ['GET'])]
    public function listAll(): JsonResponse
    {
        return new JsonResponse(
            $this->em->getRepository(Produit::class)->findBy([], ['nom' => 'ASC'])
        );
    }

    /**
     * Top N most-sold products (by total quantity in vente_items).
     * GET /api/produits/top?limit=12
     */
    #[Route('/top', methods: ['GET'])]
    public function top(Request $r): JsonResponse
    {
        $limit = max(1, min(50, (int)$r->query->get('limit', 12)));

        // Query via VenteItem aggregate
        $rows = $this->em->createQueryBuilder()
            ->select('IDENTITY(vi.produitId) AS pid, SUM(vi.quantite) AS total_qty')
            ->from(\App\Entity\VenteItem::class, 'vi')
            ->groupBy('vi.produitId')
            ->orderBy('total_qty', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        $produits = [];
        foreach ($rows as $row) {
            $p = $this->em->getRepository(Produit::class)->find($row['pid']);
            if ($p) $produits[] = $p;
        }

        // Pad with recent products if not enough sales yet
        if (count($produits) < $limit) {
            $existing = array_map(fn($p) => $p->getId(), $produits);
            $extra = $this->em->createQueryBuilder()
                ->select('p')->from(Produit::class, 'p')
                ->where('p.id NOT IN (:ids)')
                ->setParameter('ids', count($existing) ? $existing : ['__none__'])
                ->orderBy('p.createdAt', 'DESC')
                ->setMaxResults($limit - count($produits))
                ->getQuery()->getResult();
            $produits = array_merge($produits, $extra);
        }

        return new JsonResponse($produits);
    }

    /** GET /api/produits/barcode/{code} */
    #[Route('/barcode/{code}', methods: ['GET'])]
    public function findByBarcode(string $code): JsonResponse
    {
        $p = $this->em->getRepository(Produit::class)->findOneBy(['codeBarre' => $code]);
        if (!$p) return new JsonResponse(['error' => 'Produit introuvable'], 404);
        return new JsonResponse($p);
    }

    /** POST /api/produits */
    #[Route('', methods: ['POST'])]
    public function create(Request $r): JsonResponse
    {
        $data = json_decode($r->getContent(), true) ?? [];
        if (empty($data['nom'])) return new JsonResponse(['error' => 'Le nom est requis'], 422);

        $p = (new Produit())
            ->setNom($data['nom'])
            ->setCodeBarre($data['codeBarre'] ?? null)
            ->setQuantite((int)($data['quantite'] ?? 0))
            ->setPrix((float)($data['prix'] ?? 0))
            ->setPrixAchat((float)($data['prixAchat'] ?? 0))
            ->setCouleur($data['couleur'] ?? null)
            ->setPoids((float)($data['poids'] ?? 0))
            ->setStockMin((int)($data['stockMin'] ?? 0))
            ->setCategorie($data['categorie'] ?? null)
            ->setFournisseurId($data['fournisseurId'] ?? null);

        $this->em->persist($p);
        $this->em->flush();
        return new JsonResponse($p, 201);
    }

    /** PUT /api/produits/{id} */
    #[Route('/{id}', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $r): JsonResponse
    {
        $p = $this->em->getRepository(Produit::class)->find($id);
        if (!$p) return new JsonResponse(['error' => 'Introuvable'], 404);

        $data = json_decode($r->getContent(), true) ?? [];
        if (isset($data['nom']))          $p->setNom($data['nom']);
        if (array_key_exists('codeBarre',    $data)) $p->setCodeBarre($data['codeBarre']);
        if (isset($data['quantite']))     $p->setQuantite((int)$data['quantite']);
        if (isset($data['prix']))         $p->setPrix((float)$data['prix']);
        if (isset($data['prixAchat']))    $p->setPrixAchat((float)$data['prixAchat']);
        if (array_key_exists('couleur',      $data)) $p->setCouleur($data['couleur']);
        if (isset($data['poids']))        $p->setPoids((float)$data['poids']);
        if (isset($data['stockMin']))     $p->setStockMin((int)$data['stockMin']);
        if (array_key_exists('categorie',    $data)) $p->setCategorie($data['categorie']);
        if (array_key_exists('fournisseurId', $data)) $p->setFournisseurId($data['fournisseurId']);

        $this->em->flush();
        return new JsonResponse($p);
    }

    /** DELETE /api/produits/{id} */
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $p = $this->em->getRepository(Produit::class)->find($id);
        if (!$p) return new JsonResponse(['error' => 'Introuvable'], 404);
        $this->em->remove($p);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
