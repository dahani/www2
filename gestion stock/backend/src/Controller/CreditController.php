<?php

namespace App\Controller;

use App\Entity\Credit;
use App\Entity\PaiementCredit;
use App\Entity\Vente;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/credits')]
class CreditController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return new JsonResponse($this->em->getRepository(Credit::class)->findBy([], ['date' => 'DESC']));
    }

    #[Route('/{id}/paiement', methods: ['POST'])]
    public function addPaiement(string $id, Request $r): JsonResponse
    {
        $credit = $this->em->getRepository(Credit::class)->find($id);
        if (!$credit) return new JsonResponse(['error' => 'Introuvable'], 404);

        $data  = json_decode($r->getContent(), true) ?? [];
        $montant = (float)($data['montant'] ?? 0);
        $reste = $credit->getMontantTotal() - $credit->getMontantPaye();

        if ($montant <= 0 || $montant > $reste) {
            return new JsonResponse(['error' => 'Montant invalide'], 422);
        }

        $paiement = new PaiementCredit();
        $paiement->setMontant($montant);
        $paiement->setTypePaiement($data['typePaiement'] ?? 'especes');
        $paiement->setNote($data['note'] ?? null);
        $credit->addPaiement($paiement);

        $newPaye = $credit->getMontantPaye() + $montant;
        $credit->setMontantPaye($newPaye);
        $credit->setStatut($newPaye >= $credit->getMontantTotal() ? 'solde' : 'ouvert');

        // Update linked vente
        $vente = $this->em->getRepository(Vente::class)->find($credit->getVenteId());
        if ($vente) {
            $newReste = max(0, $vente->getTotal() - $newPaye);
            $vente->setMontantPaye($newPaye)->setReste($newReste);
            $vente->setStatut($newReste == 0 ? 'payee' : ($newReste == $vente->getTotal() ? 'impayee' : 'partielle'));
        }

        $this->em->flush();
        return new JsonResponse($credit);
    }
}
