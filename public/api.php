<?php
/**
 * Allied Power Industrial Company — Zero-Config cPanel Server Database API
 * Automatically persists Products, RFQs, Uploaded Product Images, and Settings
 * inside /public_html/storage/ so changes in /admin are live for all visitors worldwide.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storageDir = __DIR__ . '/storage';
$uploadsDir = $storageDir . '/uploads';

if (!is_dir($storageDir)) {
    @mkdir($storageDir, 0755, true);
}
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

$productsFile = $storageDir . '/products.json';
$rfqsFile     = $storageDir . '/rfqs.json';
$socialFile   = $storageDir . '/social.json';
$settingsFile = $storageDir . '/settings.json';

/**
 * Helper: Convert base64 data URI images into real files in /storage/uploads/
 * so product catalog JSON remains fast and lightweight.
 */
function processProductImages($product, $uploadsDir) {
    if (isset($product['image']) && is_string($product['image']) && strpos($product['image'], 'data:image/') === 0) {
        $savedUrl = saveBase64Image($product['image'], $uploadsDir);
        if ($savedUrl) {
            $product['image'] = $savedUrl;
        }
    }
    if (isset($product['images']) && is_array($product['images'])) {
        foreach ($product['images'] as $idx => $img) {
            if (is_string($img) && strpos($img, 'data:image/') === 0) {
                $savedUrl = saveBase64Image($img, $uploadsDir);
                if ($savedUrl) {
                    $product['images'][$idx] = $savedUrl;
                }
            }
        }
    }
    return $product;
}

function saveBase64Image($dataUri, $uploadsDir) {
    if (!preg_match('/^data:image\/(\w+);base64,/', $dataUri, $type)) {
        return null;
    }
    $ext = strtolower($type[1]);
    if ($ext === 'jpeg') $ext = 'jpg';
    if (!in_array($ext, ['jpg', 'png', 'webp', 'gif', 'svg'])) {
        $ext = 'png';
    }
    $base64Data = substr($dataUri, strpos($dataUri, ',') + 1);
    $decoded = base64_decode($base64Data);
    if ($decoded === false) {
        return null;
    }
    $filename = 'prod_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $filePath = $uploadsDir . '/' . $filename;
    if (@file_put_contents($filePath, $decoded) !== false) {
        return '/storage/uploads/' . $filename;
    }
    return null;
}

function readJsonFile($filePath) {
    if (!file_exists($filePath)) {
        return null;
    }
    $raw = @file_get_contents($filePath);
    if (!$raw) return null;
    $decoded = json_decode($raw, true);
    return $decoded;
}

function writeJsonFile($filePath, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return @file_put_contents($filePath, $json, LOCK_EX) !== false;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'status';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'sync') {
        echo json_encode([
            'ok'       => true,
            'products' => readJsonFile($productsFile),
            'rfqs'     => readJsonFile($rfqsFile),
            'social'   => readJsonFile($socialFile),
            'settings' => readJsonFile($settingsFile)
        ]);
        exit;
    }

    if ($action === 'products') {
        echo json_encode([
            'ok'       => true,
            'products' => readJsonFile($productsFile)
        ]);
        exit;
    }

    if ($action === 'rfqs') {
        echo json_encode([
            'ok'   => true,
            'rfqs' => readJsonFile($rfqsFile)
        ]);
        exit;
    }

    echo json_encode([
        'ok'      => true,
        'service' => 'Allied Power Industrial Company Server DB',
        'status'  => 'active'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    if ($action === 'save_products') {
        if (isset($payload['reset']) && $payload['reset'] === true) {
            if (file_exists($productsFile)) {
                @unlink($productsFile);
            }
            echo json_encode(['ok' => true, 'reset' => true]);
            exit;
        }

        $products = isset($payload['products']) && is_array($payload['products']) ? $payload['products'] : [];
        foreach ($products as $i => $prod) {
            $products[$i] = processProductImages($prod, $uploadsDir);
        }
        $saved = writeJsonFile($productsFile, $products);
        echo json_encode(['ok' => $saved, 'products' => $products]);
        exit;
    }

    if ($action === 'save_rfqs') {
        $rfqs = isset($payload['rfqs']) && is_array($payload['rfqs']) ? $payload['rfqs'] : [];
        $saved = writeJsonFile($rfqsFile, $rfqs);
        echo json_encode(['ok' => $saved, 'count' => count($rfqs)]);
        exit;
    }

    if ($action === 'add_rfq') {
        $newRfq = isset($payload['rfq']) ? $payload['rfq'] : null;
        if (!$newRfq) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Missing rfq object']);
            exit;
        }
        $existing = readJsonFile($rfqsFile);
        if (!is_array($existing)) {
            $existing = [];
        }
        array_unshift($existing, $newRfq);
        $saved = writeJsonFile($rfqsFile, $existing);
        echo json_encode(['ok' => $saved, 'rfqs' => $existing]);
        exit;
    }

    if ($action === 'save_social') {
        $social = isset($payload['social']) ? $payload['social'] : [];
        $saved = writeJsonFile($socialFile, $social);
        echo json_encode(['ok' => $saved]);
        exit;
    }

    if ($action === 'save_settings') {
        $settings = isset($payload['settings']) ? $payload['settings'] : [];
        $saved = writeJsonFile($settingsFile, $settings);
        echo json_encode(['ok' => $saved]);
        exit;
    }

    echo json_encode(['ok' => false, 'error' => 'Unknown action']);
    exit;
}
