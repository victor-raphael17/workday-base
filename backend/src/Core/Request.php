<?php

declare(strict_types=1);

namespace App\Core;

use App\Core\Exceptions\HttpException;

/**
 * Immutable-ish snapshot of the incoming HTTP request.
 *
 * Exposes the method, normalized path, query parameters, parsed JSON body and
 * route parameters bound by the router (e.g. the {id} in /medications/{id}).
 */
final class Request
{
    /** @var array<string, string> */
    public array $params = [];

    /** @var array<string, mixed>|null */
    private ?array $body = null;

    /**
     * @param array<string, mixed> $query
     */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        private readonly string $rawBody,
    ) {
    }

    public static function capture(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = '/' . trim(rawurldecode($path), '/');

        return new self($method, $path, $_GET, file_get_contents('php://input') ?: '');
    }

    /**
     * Decoded JSON body as an associative array.
     *
     * @return array<string, mixed>
     */
    public function body(): array
    {
        if ($this->body !== null) {
            return $this->body;
        }

        if (trim($this->rawBody) === '') {
            return $this->body = [];
        }

        $decoded = json_decode($this->rawBody, true);

        if (!is_array($decoded)) {
            throw new HttpException(400, 'Request body must be valid JSON.');
        }

        return $this->body = $decoded;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body()[$key] ?? $default;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function param(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }
}
