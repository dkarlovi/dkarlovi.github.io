<?php

declare(strict_types=1);

$configurator = require __DIR__ .'/vendor/sigwin/infra/resources/PHP/php-cs-fixer.php';

$header = <<<'EOF'
This file is part of the dkarlovi.github.io project.

(c) sigwin.hr
EOF;

$config = $configurator(__DIR__, $header);
/*
$config
    ->getFinder()
        ->exclude('resources/PHP');
*/

return $config;
