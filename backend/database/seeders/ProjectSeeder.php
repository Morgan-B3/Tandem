<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $project1 = Project::factory()->create([
            'title' => "Mem'téo",
            'description' => "Y'a pu d'saisons ma bonne dame !",
            'open' => false,
            'user_id' => 14,
            'collaborators' => 4,
            'collaborators_max' => 4,
            'popularity' => random_int(100,200),
            'status' => 'ongoing',
            'best-loved' => true,
            'image' => "tandem_default__memteo.avif"
        ]);
        $project1->collaborators()->attach([14, 12, 13, 15]);
        $project1->languages()->attach([1,2,3,5,6,23,33]);

        $project2 = Project::factory()->create([
            'title' => "Lir'mersion",
            'description' => "Plongez dans vos meilleures lectures.",
            'open' => true,
            'user_id' => 21,
            'collaborators' => 2,
            'collaborators_max' => 4,
            'popularity' => random_int(50,150),
            'status' => 'ongoing',
            'best-loved' => true,
            'image' => "tandem_default__liremersion.avif"
        ]);
        $project2->collaborators()->attach([21, 20]);
        $project2->languages()->attach([1,2,3,5,6,23,33]);

        $project3 = Project::factory()->create([
            'title' => "Maison Namasté",
            'description' => "Vous êtes entre de bonnes mains.",
            'open' => false,
            'user_id' => 16,
            'collaborators' => 4,
            'collaborators_max' => 4,
            'popularity' => random_int(50,150),
            'status' => 'completed',
            'best-loved' => true,
            'image' => "tandem_default__namaste.avif",
        ]);
        $project3->collaborators()->attach([16, 17, 18, 19]);
        $project3->languages()->attach([1,2,3,5,6,23,33]);

        $project4 = Project::factory()->create([
            'title' => "Taskinator",
            'description' => "Restez concentrés !",
            'open' => true,
            'user_id' => 22,
            'collaborators' => 2,
            'collaborators_max' => 2,
            'popularity' => random_int(50,100),
            'status' => 'created',
            'best-loved' => false,
            'image' => "tandem_default__taskinator.avif",
        ]);
        $project4->collaborators()->attach([22, 23]);
        $project4->languages()->attach([1,2,3,5,6,23,33]);

        // création de 10 projets aléatoires
        Project::factory(10)->create()->each(function($project){
            // Pour associer les utilisateurs aux projets :

            // déclaration du tableau users_id
            $users_id = [1,2,3,4,5,6,7,8,9,10];
            
            // récupération du nombre de collaborateurs sur le projet (dont le créateur)
            $collaborators = $project->collaborators;

            // récupération de l'id du créateur du projet
            $creator = $project->user_id;

            // association du créateur au projet 
            $project->collaborators()->attach($creator);

            // retrait de l'id du créateur du projet de la liste des id
            unset($users_id[$creator-1]);

            for ($i = 1 ; $i < $collaborators ; $i++){
                // selection d'un ID d'utilisateur aléatoire 
                $collaborator_id = array_rand($users_id, 1);

                // association de cet utilisateur au projet
                $project->collaborators()->attach($users_id[$collaborator_id]);

                // retrait de l'id de l'utilisateur de la liste des id
                unset($users_id[$collaborator_id]);
            }

            // attribution des langages :
            $project->languages()->attach([random_int(1,10),random_int(11,20),random_int(21,30),random_int(31,42)]);

            // favoris :
            $project->favorites()->attach([random_int(1,3),random_int(4,6),random_int(7,10)]);
        });

    }
}
