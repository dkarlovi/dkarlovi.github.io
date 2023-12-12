<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) sigwin.hr
 */

namespace App\Model;

final class Article
{
    public string $title;
    public string $slug;
    public string $body;
    public string $image;
    public bool $draft = false;

    public \DateTimeInterface $publishedAt;
}
