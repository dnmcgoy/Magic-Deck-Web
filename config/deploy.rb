set :application, "MagicDeck"
set :repository,  "https://github.com/dnmcgoy/MagicApp/tree/master/tdb"

set :scm, :git
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :deploy_subdir, "tdb"

role :web, "www.logic-by-design.com"                          # Your HTTP server, Apache/etc
role :app, "www.logic-by-design.com"                          # This may be the same as your `Web` server
role :db,  "www.logic-by-design.com", :primary => true        # This is where Rails migrations will run
role :db,  "www.logic-by-design.com"

# If you are using Passenger mod_rails uncomment this:
# if you're still using the script/reapear helper you will need
# these http://github.com/rails/irs_process_scripts

# namespace :deploy do
#   task :start do ; end
#   task :stop do ; end
#   task :restart, :roles => :app, :except => { :no_release => true } do
#     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
#   end
# end
