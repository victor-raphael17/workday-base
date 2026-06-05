<?php

/**
 * CA Pharmacy API — front controller.
 *
 * Every HTTP request is routed through this single entry point (see the
 * .htaccess rewrite). It loads the Composer autoloader and hands control to
 * the application kernel.
 */

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

(new App\Core\App())->run();
