<?php

namespace App\Controller;

use App\Entity\Fournisseur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/fournisseurs')]
class FournisseurController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    /**
     * Search fournisseurs via ?q= query param.
     * No query → returns empty array (avoids loading everything).
     * GET /api/fournisseurs?q=casablanca
     */
    #[Route('', name: 'fournisseur_search', methods: ['GET'])]
    public function search(Request $r): JsonResponse
    {
        $q = trim((string)$r->query->get('q', ''));

        // No ?q param at all → full list
        if (!$r->query->has('q')) {
            return new JsonResponse(
                $this->em->getRepository(Fournisseur::class)->findBy([], ['nom' => 'ASC'])
            );
        }

        if ($q === '') {
            return new JsonResponse([]);
        }

        $like = '%' . addcslashes($q, '%_') . '%';

        $results = $this->em->createQueryBuilder()
            ->select('f')
            ->from(Fournisseur::class, 'f')
            ->where('LOWER(f.nom) LIKE LOWER(:q)
                  OR LOWER(f.email) LIKE LOWER(:q)
                  OR f.tel LIKE :q
                  OR f.ice LIKE :q')
            ->setParameter('q', $like)
            ->orderBy('f.nom', 'ASC')
            ->setMaxResults(30)
            ->getQuery()
            ->getResult();

        return new JsonResponse($results);
    }

    /** GET /api/fournisseurs/{id} */
    #[Route('/{id}', name: 'fournisseur_get', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        $f = $this->em->getRepository(Fournisseur::class)->find($id);
        if (!$f) return new JsonResponse(['error' => 'Introuvable'], 404);
        return new JsonResponse($f);
    }

    #[Route('', name: 'fournisseur_create', methods: ['POST'])]
    public function create(Request $r): JsonResponse
    {
        $data = json_decode($r->getContent(), true) ?? [];
        if (empty($data['nom'])) return new JsonResponse(['error' => 'Le nom est requis'], 422);

        $f = (new Fournisseur())
            ->setNom($data['nom'])
            ->setTel($data['tel'] ?? null)
            ->setEmail($data['email'] ?? null)
            ->setIce($data['ice'] ?? null)
            ->setAddr($data['addr'] ?? null);
        $this->em->persist($f);
        $this->em->flush();
        return new JsonResponse($f, 201);
    }

    #[Route('/{id}', name: 'fournisseur_update', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $r): JsonResponse
    {
        $f = $this->em->getRepository(Fournisseur::class)->find($id);
        if (!$f) return new JsonResponse(['error' => 'Introuvable'], 404);
        $data = json_decode($r->getContent(), true) ?? [];
        if (isset($data['nom']))          $f->setNom($data['nom']);
        if (array_key_exists('tel',   $data)) $f->setTel($data['tel']);
        if (array_key_exists('email', $data)) $f->setEmail($data['email']);
        if (array_key_exists('ice',   $data)) $f->setIce($data['ice']);
        if (array_key_exists('addr',  $data)) $f->setAddr($data['addr']);
        $this->em->flush();
        return new JsonResponse($f);
    }

    #[Route('/{id}', name: 'fournisseur_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $f = $this->em->getRepository(Fournisseur::class)->find($id);
        if (!$f) return new JsonResponse(['error' => 'Introuvable'], 404);
        $this->em->remove($f);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
