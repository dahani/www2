<?php
/**
 * PNHAO - Parc National du Haut-Atlas-Oriental
 * Secure PHP Mailer Script for Contact Form Submissions
 */

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

/**
 * Parses a standard .env file and populates environment/server variables.
 */
function loadEnv($dir) {
    $path = rtrim($dir, '/') . '/.env';
    if (file_exists($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines !== false) {
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) {
                    continue;
                }
                
                // Parse key and value
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);
                    
                    // Remove surrounding quotes if present
                    $value = trim($value, '"\'');
                    
                    if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                        putenv("{$name}={$value}");
                        $_ENV[$name] = $value;
                        $_SERVER[$name] = $value;
                    }
                }
            }
        }
    }
}

// Try to find and load .env from different possible root locations
loadEnv(__DIR__);
loadEnv(__DIR__ . '/..');
loadEnv(__DIR__ . '/../..');

// Get recipient email from .env configuration or fall back to default
$toEmail = getenv('CONTACT_RECEIVER_EMAIL');
if (!$toEmail && isset($_ENV['CONTACT_RECEIVER_EMAIL'])) {
    $toEmail = $_ENV['CONTACT_RECEIVER_EMAIL'];
}
if (!$toEmail && isset($_SERVER['CONTACT_RECEIVER_EMAIL'])) {
    $toEmail = $_SERVER['CONTACT_RECEIVER_EMAIL'];
}
if (!$toEmail) {
    $toEmail = "khalid.sbai.bls@gmail.com"; // Final fallback
}

// Read raw JSON or standard POST data
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    $input = $_POST;
}

$fullName = isset($input['fullName']) ? strip_tags(trim($input['fullName'])) : '';
$email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL) : '';
$subject = isset($input['subject']) ? strip_tags(trim($input['subject'])) : '';
$role = isset($input['role']) ? strip_tags(trim($input['role'])) : 'visitor';
$message = isset($input['message']) ? strip_tags(trim($input['message'])) : '';

// Server-side validation
if (empty($fullName) || !$email || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Veuillez remplir tous les champs obligatoires correctement."]);
    exit();
}

// Map user profile to a user-friendly French label
$roleText = "Visiteur / Touriste de passage";
if ($role === 'researcher') {
    $roleText = "Chercheur / Scientifique";
} elseif ($role === 'partner') {
    $roleText = "Organisme Partenaire / ONG";
} elseif ($role === 'local') {
    $roleText = "Habitant local de la province";
}

// Prepare email headers
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'mydomain.com';
$emailSubject = "=?UTF-8?B?" . base64_encode("[PNHAO Contact] " . $subject) . "?=";

// Build simple email content text/plain
$emailBody = "Vous avez reçu un nouveau message depuis le formulaire de contact du site PNHAO.\n\n";
$emailBody .= "========================================================\n";
$emailBody .= "  INFORMATIONS DU CONTACT\n";
$emailBody .= "========================================================\n";
$emailBody .= "Nom Complet : " . $fullName . "\n";
$emailBody .= "Adresse Email : " . $email . "\n";
$emailBody .= "Profil de l'auteur : " . $roleText . "\n";
$emailBody .= "Sujet du Message : " . $subject . "\n";
$emailBody .= "========================================================\n\n";
$emailBody .= "MESSAGE :\n";
$emailBody .= $message . "\n\n";
$emailBody .= "========================================================\n";
$emailBody .= "Cet e-mail a été envoyé via le script d'automatisation mailer PHP du PNHAO.\n";

// Use safe no-reply sender header and reply-to for easy direct response
$headers = "From: PNHAO Site <no-reply@" . $host . ">\r\n";
$headers .= "Reply-To: " . $fullName . " <" . $email . ">\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

// Execute native mail delivery
if (mail($toEmail, $emailSubject, $emailBody, $headers)) {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Votre message a été envoyé avec succès."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Désolé, une erreur technique est survenue sur le serveur de messagerie lors de l'envoi de votre e-mail."]);
}
