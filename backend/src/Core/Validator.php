<?php

declare(strict_types=1);

namespace App\Core;

use App\Core\Exceptions\ValidationException;

/**
 * Small rule-based validator.
 *
 * Rules are expressed per field as a pipe-delimited string, e.g.
 *   ['name' => 'required|string|max:120', 'price' => 'required|numeric|min:0']
 *
 * Supported rules: required, nullable, string, integer, numeric, boolean,
 * date, email, in:a,b,c, min:n, max:n.
 *
 * Returns only the fields that were present and valid, with values cast to
 * their declared type. Throws ValidationException (422) on any failure.
 */
final class Validator
{
    /**
     * @param array<string, mixed>  $data
     * @param array<string, string> $rules
     * @return array<string, mixed>
     */
    public static function validate(array $data, array $rules): array
    {
        $validated = [];
        /** @var array<string, string[]> $errors */
        $errors = [];

        foreach ($rules as $field => $ruleString) {
            $ruleSet = self::parse($ruleString);
            $present = array_key_exists($field, $data);
            $value = $present ? $data[$field] : null;

            $isRequired = isset($ruleSet['required']);
            $isNullable = isset($ruleSet['nullable']);

            if (!$present || $value === null) {
                if ($isRequired && !($present && $value === null && $isNullable)) {
                    $errors[$field][] = "The {$field} field is required.";
                } elseif ($present && $value === null && $isNullable) {
                    $validated[$field] = null;
                }
                continue;
            }

            $fieldErrors = [];
            $cast = self::applyType($field, $value, $ruleSet, $fieldErrors);

            if ($fieldErrors === []) {
                self::applyConstraints($field, $cast, $ruleSet, $fieldErrors);
            }

            if ($fieldErrors === []) {
                $validated[$field] = $cast;
            } else {
                $errors[$field] = array_merge($errors[$field] ?? [], $fieldErrors);
            }
        }

        if ($errors !== []) {
            throw new ValidationException($errors);
        }

        return $validated;
    }

    /**
     * @return array<string, string|null> rule name => argument (or null)
     */
    private static function parse(string $ruleString): array
    {
        $rules = [];

        foreach (explode('|', $ruleString) as $rule) {
            $rule = trim($rule);
            if ($rule === '') {
                continue;
            }
            [$name, $arg] = array_pad(explode(':', $rule, 2), 2, null);
            $rules[$name] = $arg;
        }

        return $rules;
    }

    /**
     * @param array<string, string|null> $rules
     * @param string[]                   $errors
     */
    private static function applyType(string $field, mixed $value, array $rules, array &$errors): mixed
    {
        if (isset($rules['integer'])) {
            if (!is_int($value) && !(is_string($value) && preg_match('/^-?\d+$/', $value))) {
                $errors[] = "The {$field} field must be an integer.";
                return $value;
            }
            return (int) $value;
        }

        if (isset($rules['numeric'])) {
            if (!is_numeric($value)) {
                $errors[] = "The {$field} field must be a number.";
                return $value;
            }
            return $value + 0;
        }

        if (isset($rules['boolean'])) {
            if (is_bool($value)) {
                return $value;
            }
            if (in_array($value, [0, 1, '0', '1', 'true', 'false'], true)) {
                return in_array($value, [1, '1', 'true'], true);
            }
            $errors[] = "The {$field} field must be true or false.";
            return $value;
        }

        if (isset($rules['date'])) {
            if (!is_string($value) || strtotime($value) === false) {
                $errors[] = "The {$field} field must be a valid date.";
            }
            return $value;
        }

        if (isset($rules['email'])) {
            if (!is_string($value) || !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "The {$field} field must be a valid email address.";
            }
            return $value;
        }

        if (isset($rules['string'])) {
            if (!is_string($value)) {
                $errors[] = "The {$field} field must be a string.";
                return $value;
            }
            return trim($value);
        }

        return $value;
    }

    /**
     * @param array<string, string|null> $rules
     * @param string[]                   $errors
     */
    private static function applyConstraints(string $field, mixed $value, array $rules, array &$errors): void
    {
        $size = is_string($value) ? mb_strlen($value) : (is_numeric($value) ? $value + 0 : null);

        if (isset($rules['min']) && $size !== null && $size < (float) $rules['min']) {
            $errors[] = is_string($value)
                ? "The {$field} field must be at least {$rules['min']} characters."
                : "The {$field} field must be at least {$rules['min']}.";
        }

        if (isset($rules['max']) && $size !== null && $size > (float) $rules['max']) {
            $errors[] = is_string($value)
                ? "The {$field} field must not exceed {$rules['max']} characters."
                : "The {$field} field must not exceed {$rules['max']}.";
        }

        if (isset($rules['in'])) {
            $allowed = explode(',', (string) $rules['in']);
            if (!in_array((string) $value, $allowed, true)) {
                $errors[] = "The {$field} field must be one of: " . implode(', ', $allowed) . '.';
            }
        }
    }
}
