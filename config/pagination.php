<?php

return [
    /*
    | Default rows shown on administrative list pages.
    */
    'per_page' => (int) env('PAGINATION_PER_PAGE', 25),

    'options' => [25, 50, 100],
];
