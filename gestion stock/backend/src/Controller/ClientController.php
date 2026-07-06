<?php

namespace App\Controller;

use App\Entity\Client;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/clients')]
class ClientController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    /**
     * Search clients via ?q= query param.
     * No query → returns empty array.
     * With query → AJAX search by nom / tel / email (max 30 results).
     * Without query param → returns all clients (used by POS client selector).
     *
     * GET /api/clients          → all clients
     * GET /api/clients?q=ahmed  → search
     */
    #[Route('', methods: ['GET'])]
    public function list(Request $r): JsonResponse
    {
        // If ?q= param is present (even empty string), treat as search
        if ($r->query->has('q')) {
            $q = trim((string)$r->query->get('q', ''));
            if ($q === '') return new JsonResponse([]);

            $like = '%' . addcslashes($q, '%_') . '%';
            $results = $this->em->createQueryBuilder()
                ->select('c')
                ->from(Client::class, 'c')
                ->where('LOWER(c.nom) LIKE LOWER(:q) OR c.tel LIKE :q OR LOWER(c.email) LIKE LOWER(:q)')
                ->setParameter('q', $like)
                ->orderBy('c.nom', 'ASC')
                ->setMaxResults(30)
                ->getQuery()
                ->getResult();
            return new JsonResponse($results);
        }

        // No ?q param → full list (used by POS)
        return new JsonResponse(
            $this->em->getRepository(Client::class)->findBy([], ['nom' => 'ASC'])
        );
    }

    /** GET /api/clients/{id} */
    #[Route('/{id}', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        $c = $this->em->getRepository(Client::class)->find($id);
        if (!$c) return new JsonResponse(['error' => 'Introuvable'], 404);
        return new JsonResponse($c);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $r): JsonResponse
    {
        $data = json_decode($r->getContent(), true) ?? [];
        if (empty($data['nom'])) return new JsonResponse(['error' => 'Le nom est requis'], 422);

        $c = (new Client())
            ->setNom($data['nom'])
            ->setTel($data['tel'] ?? null)
            ->setEmail($data['email'] ?? null)
            ->setAddr($data['addr'] ?? null);
        $this->em->persist($c);
        $this->em->flush();
        return new JsonResponse($c, 201);
    }

    #[Route('/{id}', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $r): JsonResponse
    {
        $c = $this->em->getRepository(Client::class)->find($id);
        if (!$c) return new JsonResponse(['error' => 'Introuvable'], 404);
        $data = json_decode($r->getContent(), true) ?? [];
        if (isset($data['nom']))          $c->setNom($data['nom']);
        if (array_key_exists('tel',   $data)) $c->setTel($data['tel']);
        if (array_key_exists('email', $data)) $c->setEmail($data['email']);
        if (array_key_exists('addr',  $data)) $c->setAddr($data['addr']);
        $this->em->flush();
        return new JsonResponse($c);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $c = $this->em->getRepository(Client::class)->find($id);
        if (!$c) return new JsonResponse(['error' => 'Introuvable'], 404);
        $this->em->remove($c);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}
