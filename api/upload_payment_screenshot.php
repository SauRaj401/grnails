<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

if (!isset($_FILES["image"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No file received"]);
    exit;
}

$file = $_FILES["image"];
$maxSize = 5 * 1024 * 1024;
$allowedMimeTypes = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp",
];

if (!isset($file["error"]) || is_array($file["error"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid upload payload"]);
    exit;
}

if ($file["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Upload failed with code " . $file["error"]]);
    exit;
}

if ($file["size"] > $maxSize) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "File is too large. Maximum size is 5MB."]);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = $finfo ? finfo_file($finfo, $file["tmp_name"]) : false;
if ($finfo) {
    finfo_close($finfo);
}

if (!isset($allowedMimeTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid file type. Only JPEG, PNG, and WEBP are allowed."]);
    exit;
}

$targetDir = __DIR__ . "/../uploads/payment_screenshots/";
if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Unable to create upload directory"]);
    exit;
}

try {
    $uniqueName = date("Ymd_His") . "_" . bin2hex(random_bytes(8)) . "." . $allowedMimeTypes[$mimeType];
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Unable to generate file name"]);
    exit;
}

$targetFile = $targetDir . $uniqueName;
if (!move_uploaded_file($file["tmp_name"], $targetFile)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Upload failed"]);
    exit;
}

$publicPath = "/uploads/payment_screenshots/" . $uniqueName;
$isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") || (isset($_SERVER["SERVER_PORT"]) && (int)$_SERVER["SERVER_PORT"] === 443);
$scheme = $isHttps ? "https" : "http";
$host = $_SERVER["HTTP_HOST"] ?? "localhost";
$absoluteUrl = $scheme . "://" . $host . $publicPath;

echo json_encode([
    "success" => true,
    "imageUrl" => $publicPath,
    "imagePath" => $publicPath,
    "absoluteUrl" => $absoluteUrl,
    "fileName" => $uniqueName,
]);