package main

import (
	b64 "encoding/base64"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

type Resp struct {
	AccessToken  string  `json:"access_token"`
	TokenType    string  `json:"token_type"`
	ExpiresIn    float64 `json:"expires_in"`
	RefreshToken string  `json:"refresh_token"`
	Scope        string  `json:"scope"`
}

func getEncodedAuthString() string {
	clientId := os.Getenv("REACT_APP_CLIENT_ID")
	clientSecret := os.Getenv("REACT_APP_CLIENT_SECRET")
	data := clientId + ":" + clientSecret

	return "Basic " + b64.StdEncoding.EncodeToString([]byte(data))
}

func handleGet(c *gin.Context) {
	spotifyTokenUrl := "https://accounts.spotify.com/api/token"
	code := c.Query("code")

	redirectUri := os.Getenv("REACT_APP_REDIRECT_URI")

	data := url.Values{}
	data.Set("code", code)
	data.Set("redirect_uri", redirectUri)
	data.Set("grant_type", "authorization_code")

	client := &http.Client{}

	req, _ := http.NewRequest("POST", spotifyTokenUrl, strings.NewReader(data.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Authorization", getEncodedAuthString())

	resp, err := client.Do(req)

	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	responseJson := new(Resp)
	json.Unmarshal([]byte(string(body)), responseJson)

	token := responseJson.AccessToken
	base := os.Getenv("REACT_APP_BASE")
	q := url.Values{}
	q.Set("token", token)
	location := url.URL{Path: base, RawQuery: q.Encode()}
	c.Redirect(http.StatusFound, location.RequestURI())
}

func main() {
	router := gin.Default()
	router.GET("/login", handleGet)
	router.Run(":" + os.Getenv("PORT"))
}
