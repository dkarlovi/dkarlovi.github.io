<?php

declare(strict_types=1);

$configurator = require __DIR__ .'/vendor/sigwin/infra/resources/PHP/php-cs-fixer.php';

$header = <<<'EOF'
This file is part of the dkarlovi.github.io project.

(c) Dalibor Karlović
EOF;

return $configurator(__DIR__, $header);
