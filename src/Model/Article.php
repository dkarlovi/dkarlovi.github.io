<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Sigwin\YASSG\Collection;

final class Article
{
    public string $title;
    public string $slug;
    public string $summary;
    public string $body;
    public ?string $image = null;
    public bool $draft = false;

    /**
     * @var Collection<string, Taxonomy>
     */
    public Collection $categories;

    /**
     * @var Collection<string, Taxonomy>
     */
    public Collection $series;

    public array $keywords = [];

    public \DateTimeInterface $publishedAt;
}
