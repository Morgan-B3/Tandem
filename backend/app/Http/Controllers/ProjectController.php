<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;


class ProjectController extends Controller
{
    /**
     * Affichage de tous les projets
     */
    function index() {
        $projects = Project::all();
        foreach($projects as $project){
            $creator = $project->creator()->first();
            $languages = $project->languages()->get();
            $project->creator = $creator;
            $project->languages = $languages;
        }
        return response()->json([
            'projects' => $projects,
            "status" => 200,
        ]);
    }

    /**
     * Affiche un seul projet
     */
    function show($id) {
        $project = Project::findOrFail($id);

        //Attribution des collaborateurs et leur avatar
        $collaborators = $project->collaborators()->get();
        foreach($collaborators as $collaborator){
            $avatar = $collaborator->avatar()->first();
            $collaborator->avatar = $avatar;
        }
        $project->collaboratorsList = $collaborators;

        //Attribution des commentaires, leur auteur et leur avatar
        $comments = $project->comments()->get();
        foreach($comments as $comment){
            $user = $comment->user()->first();
            $avatar = $user->avatar()->first();
            $user->avatar = $avatar;
            $comment->user = $user;
        }
        $project->comments = $comments;

        //Attribution du créateur
        $creator = $project->creator()->first();
        $project->creator = $creator;

        //Attribution des langages
        $languages = $project->languages()->get();
        $project->languages = $languages;

        return response()->json([
            'project' => $project,
            "status"=> 200,
        ]);
    }

    /**
     * Enregistre un nouveau projet
     */
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'title' => "required|unique:projects,title|max:50|min:3",
            'description' => "required|max:1000|min:3",
            'collaborators_max' => "required|numeric"
        ]);
        
        if($validator->fails()){
            return response()->json([
                'errors' => $validator->messages(),
                "message" => "Erreur dans le formulaire",
                'status' => "error",
            ]);
        } else{
            $project = new Project();
            $project->title = $request->input('title');
            $project->description = $request->input('description');
            $project->collaborators_max = $request->input('collaborators_max');
            $project->collaborators = 1;
            $project->user_id = auth()->user()->id;
            $project->status = 'created';
            $project->open = true;
            $project->popularity = 0;
            $project->image = "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

            $project->save();

            $project->languages()->sync($request->languages);

            return response()-> json([
                'status' => 200,
                "message" => "Le projet a été ajouté."
            ]);
        }
    }


    /**
     * Mise à jour des infos d'un projet existant
     */
    public function update(Request $request, $id){
        $project = Project::findOrFail($id);
        if ($request->user()->tokenCan($project->user_id)) {
            $validator = Validator::make($request->all(),[
                'newTitle' => "max:50|min:3|unique:projects,title," . $project->id,
                'newDescription' => "max:1000|min:3",
                'newCollaborators' => "numeric"
            ]);
            if($validator->fails()){
                return response()->json([
                    'errors' => $validator->messages(),
                    "message" => "Erreur dans le formulaire."
                ]);
            } else {
                $project->title = $request->input("newTitle");
                $project->description = $request->input("newDescription");
                $project->collaborators = $request->input("newCollaborators");
                $project->save();

                return response()->json([
                    'status' => 200,
                    "message" => "Le projet a été ajouté."
                ]);
            }
        } else {
            return response()->json([
                'errors' => [],
                "message" => "Action impossible.",
                "status" => "error"
            ]);
        }
    }

    /**
     * Fait progresser le statut du projet
     */
    public function nextStep($id){
        $project = Project::find($id);
        if($project->id == auth()->user()->id){
            if($project->status === "created"){
                $project->status = "ongoing";
            } else if ($project->status === "ongoing"){
                $project->status = "completed";
            }
            return response()->json([
                'status' => 200
            ]);
        } else {
            return response()->json([
                "status" => "error"
            ]);
        }
    }

    /**
     * Ajoute/Retire le projet aux favoris
     */
    public function favorite($id){
        $project = Project::find($id);
        $user_id = auth()->user()->id;
        $user = User::find($user_id);
        $user->favorites()->toggle($project);
    }

    /**
     * Ajoute/Supprime un like au projet
     */
    public function like($id){
        $project = Project::find($id);
        $user_id = auth()->user()->id;
        $user = User::find($user_id);
        $user->likes()->toggle($project);
    }

    /**
     * Supprime un projet
     */
    public function delete(Request $request, $id){
        $project = Project::findOrFail($id);
        if ($request->user()->tokenCan($project->user_id)) {
            Project::destroy($id);
            return response()->json([
                'status' => 200,
                "message" => "Le projet a été supprimé"
            ]);
        }
    }
}
