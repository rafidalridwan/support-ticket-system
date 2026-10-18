<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketEventNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Ticket $ticket,
        public string $event,
        public string $message,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title())
            ->greeting('Hello '.$notifiable->name.',')
            ->line($this->message)
            ->line('Ticket: '.$this->ticket->ticket_number)
            ->line('Subject: '.$this->ticket->subject)
            ->action('View ticket', $this->ticketUrl())
            ->line('Thank you.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'event' => $this->event,
            'title' => $this->title(),
            'message' => $this->message,
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
            'unique_key' => $this->ticket->unique_key,
            'url' => $this->ticketUrl(),
        ];
    }

    private function title(): string
    {
        return match ($this->event) {
            'ticket_created' => 'Ticket created',
            'ticket_assigned' => 'Ticket assigned',
            'agent_replied' => 'Agent replied',
            'customer_replied' => 'Customer replied',
            'ticket_resolved' => 'Ticket resolved',
            'sla_approaching' => 'SLA approaching',
            'sla_breached' => 'SLA breached',
            default => 'Ticket update',
        };
    }

    private function ticketUrl(): string
    {
        return url('/administrative/ticket/'.$this->ticket->unique_key);
    }
}
