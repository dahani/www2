<?php

namespace App\Controller;

use App\Entity\AppSetting;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/settings')]
class SettingsController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('', methods: ['GET'])]
    public function get(): JsonResponse
    {
        return new JsonResponse($this->getOrCreate());
    }

    #[Route('', methods: ['PUT', 'PATCH'])]
    public function update(Request $r): JsonResponse
    {
        $s = $this->getOrCreate();
        $data = json_decode($r->getContent(), true) ?? [];
        if (isset($data['nom'])) $s->setNom($data['nom']);
        if (array_key_exists('tel', $data)) $s->setTel($data['tel']);
        if (array_key_exists('addr', $data)) $s->setAddr($data['addr']);
        if (array_key_exists('email', $data)) $s->setEmail($data['email']);
        if (array_key_exists('ice', $data)) $s->setIce($data['ice']);
        $this->em->flush();
        return new JsonResponse($s);
    }

    private function getOrCreate(): AppSetting
    {
        $s = $this->em->getRepository(AppSetting::class)->find(1);
        if (!$s) {
            $s = new AppSetting();
            $this->em->persist($s);
            $this->em->flush();
        }
        return $s;
    }
}
