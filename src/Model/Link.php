<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Symfony\Component\Validator\Constraints as Assert;

final class Link
{
    #[Assert\NotBlank]
    public string $title;
    #[Assert\NotBlank]
    public string $icon;
    #[Assert\NotBlank]
    public string $url;
}
