<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Comment;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // suppression des images de projet présentes dans le dossier images
        $projectImagesFolder = scandir('public/images/projects');  
        for($i=3; $i<count($projectImagesFolder); $i++){
            $file = pathinfo($projectImagesFolder[$i]);
            File::delete('public/images/projects/'.$file["basename"]);
        }  

        $this->call([
            AvatarSeeder::class,
            LanguageSeeder::class,
            UserSeeder::class,
            ProjectSeeder::class,
            CommentSeeder::class
            
        ]);

    }
}
