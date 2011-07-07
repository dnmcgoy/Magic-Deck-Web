<%
  # This seems like quite a hack, but still better than the others that
  # come to mind for getting a template needed by the javascript
  run = Struct.new("FakeRun", :id, :count, :name, :cmc, :cc, :cardtype, :oracle_text).new if run.nil?
%>

<div id="<%= run.id %>" class="portlet run">
  <div class="run_count"><%= run.count %></div>
  <div class="card_name"><%= run.name %></div>

  <div><span class='delete_run' href=''>X</span></div>
</div>
