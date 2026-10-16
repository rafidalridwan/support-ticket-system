<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    $response = $next($request);

    // Add security headers to prevent various attacks
    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-Frame-Options', 'DENY');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Content Security Policy - environment aware
    $csp = $this->buildCsp($request);
    $response->headers->set('Content-Security-Policy', $csp);

    return $response;
  }

  /**
   * Build Content Security Policy based on environment
   */
  private function buildCsp(Request $request): string
  {
    $isDevelopment = app()->environment('local', 'development');

    // Base CSP directives
    $scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
    $styleSrc = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];
    $fontSrc = ["'self'", "data:", "https://fonts.gstatic.com"];
    $connectSrc = ["'self'"];

    // In development, allow Vite dev server
    if ($isDevelopment) {
      // Allow Vite dev server on common ports
      $viteHosts = [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'ws://127.0.0.1:5173',
        'ws://localhost:5173',
        'wss://127.0.0.1:5173',
        'wss://localhost:5173',
        'http://127.0.0.1:14173',
        'http://localhost:14173',
        'ws://127.0.0.1:14173',
        'ws://localhost:14173',
        'wss://127.0.0.1:14173',
        'wss://localhost:14173',
      ];

      $scriptSrc = array_merge($scriptSrc, $viteHosts);
      $connectSrc = array_merge($connectSrc, $viteHosts);
    }

    // Build CSP string
    $directives = [
      "default-src 'self'",
      "script-src " . implode(' ', $scriptSrc),
      "style-src " . implode(' ', $styleSrc),
      "img-src 'self' data: blob: https:",
      "font-src " . implode(' ', $fontSrc),
      "connect-src " . implode(' ', $connectSrc),
    ];

    return implode('; ', $directives) . ';';
  }
}
