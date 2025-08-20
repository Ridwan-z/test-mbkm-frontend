<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        // Create organizer user
        $organizer = User::create([
            'name' => 'Event Organizer',
            'email' => 'organizer@example.com',
            'password' => bcrypt('password'),
            'role' => 'organizer'
        ]);

        // Create sample events
        Event::create([
            'title' => 'Tech Conference 2024',
            'description' => 'Annual technology conference featuring latest trends in web development',
            'venue' => 'Jakarta Convention Center',
            'start_datetime' => now()->addDays(30),
            'end_datetime' => now()->addDays(31),
            'status' => 'published',
            'price' => 500000,
            'max_participants' => 200,
            'organizer_id' => $organizer->id
        ]);

        Event::create([
            'title' => 'Startup Pitch Night',
            'description' => 'Monthly startup pitch competition',
            'venue' => 'Co-working Space Sudirman',
            'start_datetime' => now()->addDays(15),
            'end_datetime' => now()->addDays(15)->addHours(4),
            'status' => 'published',
            'price' => 100000,
            'max_participants' => 50,
            'organizer_id' => $organizer->id
        ]);
    }
}
