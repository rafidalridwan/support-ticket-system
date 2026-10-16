<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ $websiteName ?? config('app.name', 'Pera') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
        rel="stylesheet" />
    <link rel="icon" href="{{ $websiteFavicon ?? 'data:,' }}" />
    <script>
        (function () {
            try {
                var key = 'pera-color-mode';
                var stored = localStorage.getItem(key);
                var mode = stored === 'light' || stored === 'dark' ? stored : 'light';
                document.documentElement.classList.toggle('dark', mode === 'dark');
                document.documentElement.style.colorScheme = mode;
                document.documentElement.dataset.theme = mode;
            } catch (e) {}
        })();
    </script>
    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-background text-foreground">
    @inertia
</body>

</html>
