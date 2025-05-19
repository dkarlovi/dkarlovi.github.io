<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Sigwin\YASSG\Collection;
use Symfony\Component\Validator\Constraints as Assert;

final class Article
{
    #[Assert\NotBlank]
    public string $title;
    #[Assert\NotBlank]
    public string $slug;
    #[Assert\NotBlank]
    public string $summary;
    #[Assert\NotBlank]
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

    public ?string $discussReddit = null;
    public ?int $discussHackerNews = null;
}
