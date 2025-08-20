<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Organizer 1
        $organizer1 = User::create([
            'name' => 'Organizer One',
            'email' => 'organizer1@example.com',
            'password' => bcrypt('password'),
            'role' => 'organizer',
        ]);

        // Organizer 2
        $organizer2 = User::create([
            'name' => 'Organizer Two',
            'email' => 'organizer2@example.com',
            'password' => bcrypt('password'),
            'role' => 'organizer',
        ]);

        // Events (10) dibagi 2 organizer
        $eventData = [
            [
                'title' => 'Tech Conference 2024',
                'description' => 'Annual technology conference featuring latest trends in web development',
                'venue' => 'Jakarta Convention Center',
                'start_datetime' => now()->addDays(30),
                'end_datetime' => now()->addDays(31),
                'price' => 500000,
                'max_participants' => 200,
            ],
            [
                'title' => 'Startup Pitch Night',
                'description' => 'Monthly startup pitch competition',
                'venue' => 'Co-working Space Sudirman',
                'start_datetime' => now()->addDays(15),
                'end_datetime' => now()->addDays(15)->addHours(4),
                'price' => 100000,
                'max_participants' => 50,
            ],
            [
                'title' => 'Design Workshop',
                'description' => 'Hands-on workshop on UI/UX design',
                'venue' => 'Ruang Kreatif Bandung',
                'start_datetime' => now()->addDays(10),
                'end_datetime' => now()->addDays(10)->addHours(6),
                'price' => 150000,
                'max_participants' => 80,
            ],
            [
                'title' => 'Web Development Bootcamp',
                'description' => 'Intensive bootcamp to master full-stack development',
                'venue' => 'Online Zoom',
                'start_datetime' => now()->addDays(45),
                'end_datetime' => now()->addDays(50),
                'price' => 750000,
                'max_participants' => 100,
            ],
            [
                'title' => 'Cybersecurity Talk',
                'description' => 'Discussion on emerging cybersecurity threats',
                'venue' => 'Universitas Indonesia',
                'start_datetime' => now()->addDays(20),
                'end_datetime' => now()->addDays(20)->addHours(3),
                'price' => 0,
                'max_participants' => 120,
            ],
            [
                'title' => 'AI & Machine Learning Conference',
                'description' => 'Explore advancements in artificial intelligence',
                'venue' => 'Hotel Mulia, Jakarta',
                'start_datetime' => now()->addDays(60),
                'end_datetime' => now()->addDays(61),
                'price' => 600000,
                'max_participants' => 250,
            ],
            [
                'title' => 'Hackathon Weekend',
                'description' => '48-hour coding competition for developers',
                'venue' => 'Universitas Brawijaya',
                'start_datetime' => now()->addDays(5),
                'end_datetime' => now()->addDays(7),
                'price' => 50000,
                'max_participants' => 300,
            ],
            [
                'title' => 'Tech Job Fair',
                'description' => 'Meet top tech companies and find job opportunities',
                'venue' => 'ICE BSD',
                'start_datetime' => now()->addDays(25),
                'end_datetime' => now()->addDays(25)->addHours(8),
                'price' => 0,
                'max_participants' => 1000,
            ],
            [
                'title' => 'Cloud Computing 101',
                'description' => 'Intro to cloud infrastructure and services',
                'venue' => 'Binus University',
                'start_datetime' => now()->addDays(12),
                'end_datetime' => now()->addDays(12)->addHours(2),
                'price' => 80000,
                'max_participants' => 60,
            ],
            [
                'title' => 'Mobile App Development Seminar',
                'description' => 'Learn about building cross-platform mobile apps',
                'venue' => 'Telkom University',
                'start_datetime' => now()->addDays(18),
                'end_datetime' => now()->addDays(18)->addHours(5),
                'price' => 120000,
                'max_participants' => 90,
            ],
        ];

        foreach ($eventData as $i => $data) {
            Event::create(array_merge($data, [
                'status' => 'published',
                'organizer_id' => $i < 5 ? $organizer1->id : $organizer2->id,
            ]));
        }
    }
}
