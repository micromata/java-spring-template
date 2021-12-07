package {{ params['userJavaPackage'] }};

/**
 * Informations which are described in the info part of the asyncApi
 */
public class AsyncApiInfo {

  {% if asyncapi.info().title() != '' %}
  public static String getTitle() {
    return "{{ asyncapi.info().title() }}";
  }
  {%- endif %}

  {% if asyncapi.info().version() != '' %}
  public static String getVersion() {
    return "{{ asyncapi.info().version() }}";
  }
  {%- endif %}

  {% if asyncapi.info().description() != '' %}
  public static String getDescription() {
    return "{{ asyncapi.info().description() }}";
  }
  {%- endif %}
    
    
}
