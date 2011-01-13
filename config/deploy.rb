require "bundler/capistrano"

set :application, "MagicDeck"
set :repository,  "/home/ckhrysze/webapps/ckhrysze_git/repos/magicdeck.git"

set :scm, :git
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :deploy_to, "/home/ckhrysze/webapps/magicdeck"

role :web, "anaelise.net"                          # Your HTTP server, Apache/etc
role :app, "anaelise.net"                          # This may be the same as your `Web` server
# role :db,  "www.logic-by-design.com", :primary => true        # This is where Rails migrations will run
# role :db,  "www.logic-by-design.com"

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
