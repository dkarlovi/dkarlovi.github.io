<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Symfony\Component\Validator\Constraints as Assert;

final class Taxonomy
{
    #[Assert\NotBlank]
    public string $title;
    #[Assert\NotBlank]
    public string $slug;
    #[Assert\NotBlank]
    public string $summary;
    public ?string $body = null;
    public ?string $image = null;
}
