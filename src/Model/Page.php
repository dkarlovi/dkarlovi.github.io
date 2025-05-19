<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Symfony\Component\Validator\Constraints as Assert;

final class Page
{
    #[Assert\NotBlank]
    public string $title;
    #[Assert\NotBlank]
    public string $route;
    public ?string $summary = null;
    public ?string $body = null;
    public ?string $image = null;
}
