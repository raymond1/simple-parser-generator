package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

var rootPathLength int

func main() {
	rootPath := "/ocsp/"
	rootPathLength = len(rootPath)

	if len(os.Args) < 2 {
		fmt.Printf("Usage: go run troubleshooting_server.go [port number]\n")
		/// executable os.Args[1], os.Args[2], os.Args[3] ...
		os.Exit(0)
	}

	port := os.Args[1]

	// handle route using handler function
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		if (*r).Method == "GET" {
			fmt.Printf("GET method detected: |%s|", r.URL.Path)
			if len(r.URL.Path) >= rootPathLength {
				relevantPath := r.URL.Path[rootPathLength:]
				fmt.Printf("Encoded URL path: %s", relevantPath)
				decodedString, err := base64.StdEncoding.DecodeString((*r).URL.Path[rootPathLength:])
				if err != nil {
					fmt.Println("Error:", err)
				}
				ioutil.WriteFile("decoded_nginx_request.txt", decodedString, 0777)
				byteReader := bytes.NewReader(decodedString)
				response, err := http.Post("http://certificate.authority:81", "application/ocsp-request", byteReader)

				if err != nil {
					fmt.Println("Error:", err)
				} else {
					fmt.Printf("%v", response)
				}
				// w.Header().Set("Content-Type", "application/ocsp-request")
				// w.Write(decodedString)
				ioutil.WriteFile("response_from_ocsp_server.txt", decodedString, 0777)
			} else {
				fmt.Printf("Error. URL fragment is too small.")
			}
		} else if r.Method == "POST" {

		}

	})

	// listen to port
	http.ListenAndServe(":"+port, nil)

	// listener, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	// if err != nil {
	// 	panic(err)
	// }

	// for {
	// 	fmt.Println("Ready to accept")
	// 	conn, err := listener.Accept()
	// 	if err != nil {
	// 		fmt.Println("Accept Error", err)
	// 		continue
	// 	}

	// 	fmt.Println("Connection accepted from ", conn.RemoteAddr())
	// 	//		conn.Write([]byte(">"))

	// 	//create a routine dont block
	// 	handleConnection(conn)
	// 	fmt.Printf("After handleConnection")
	// }
}

// func handleConnection(conn net.Conn) {
// 	defer conn.Close()

// 	reader := bufio.NewReader(conn)

// 	data := ""
// 	for {
// 		// bytesReady := reader.Buffered()
// 		// fmt.Println(bytesReady)
// 		// if bytesReady > 0 {
// 		bytes, err := reader.ReadBytes('\n')
// 		if err != nil {
// 			fmt.Printf("%s", bytes)
// 			fmt.Printf("LAST END\n")
// 			data += string(bytes)

// 			fmt.Println("Error 1:", err)
// 			break
// 		}
// 		fmt.Printf("%s", bytes)
// 		fmt.Printf("END\n")

// 		data += string(bytes)
// 		// }
// 	}

// 	fmt.Printf("%s", data)
// 	_, err := os.Create("nginx_request.txt")
// 	if err != nil {
// 		fmt.Println("Error when creating nginx_request.txt")
// 		os.Exit(0)
// 	}

// 	//io.WriteCloser
// 	ioutil.WriteFile("nginx_request.txt", []byte(data), os.FileMode(0777))
// 	decodedString, err := base64.StdEncoding.DecodeString(data)
// 	if err != nil {
// 		fmt.Println("Error when decoding data", err)
// 	}

// 	ioutil.WriteFile("decoded_nginx_request.txt", decodedString, 0777)

// 	//conn.Write([]byte(""))//What needs to be written?
// 	// GET /ocsp/MEIwQDA%2BMDwwOjAJBgUrDgMCGgUABBTWGNJuwZk80d%2BsZ67RB3EB%2Fzi4vQQUEj4XGxG%2B4Jpy2zF8qbpZkyMZ%2B3oCASs%3D
// 	// HTTP/1.0
// 	// Host: certificate.authority
// }
