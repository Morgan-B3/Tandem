<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Nette\Utils\Random;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $collaborators_max = random_int(1,10) ;
        $collaborators = random_int(1,$collaborators_max);
        $isOpen = true;
        if ($collaborators === $collaborators_max){
            $isOpen = false;
        }
        $statuses1 = ['created', 'ongoing'];
        $statuses2 = ['ongoing', 'completed'];
        if ($isOpen){
            $status = $statuses1[random_int(0,1)];
        } else {
            $status = $statuses2[random_int(0,1)];
        }

        // Récupère le contenu du dossier avatar sous forme de tableau
        $projectImagesFolder = scandir('public/images/projects/default');   
                
        $projectImages = [];

        // parcourt le tableau en évitant les 2 premiers éléments (artefacts)
        for($i=2; $i<count($projectImagesFolder); $i++){
            // récupère les informations du fichier
            $file = pathinfo($projectImagesFolder[$i]);
            array_push($projectImages, $file["basename"]);
        }  

        return [
            'title' => fake()->sentence(),
            'description' => fake()->text(),
            'user_id' => fake()->numberBetween(1,10),
            // 'image' => "https://picsum.photos/id/".random_int(9,600)."/800/450",
            "image" => $projectImages[random_int(4,count($projectImages)-1)],
            'collaborators' => $collaborators,
            'collaborators_max' => $collaborators_max,
            'open' => $isOpen,
            'status' => $status,
            'popularity' => fake()->numberBetween(0,100),
        ];
    }
}
